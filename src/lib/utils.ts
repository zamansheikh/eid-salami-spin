export function generateRandomDistribution(totalAmount: number, peopleCount: number) {
  if (peopleCount <= 0) {
    throw new Error("People count must be greater than zero.");
  }

  if (totalAmount < peopleCount) {
    throw new Error("Total amount must be at least equal to people count.");
  }

  const remaining = totalAmount - peopleCount;
  const cuts = [0, remaining];

  for (let i = 0; i < peopleCount - 1; i += 1) {
    cuts.push(Math.floor(Math.random() * (remaining + 1)));
  }

  cuts.sort((a, b) => a - b);

  const parts: number[] = [];
  for (let i = 1; i < cuts.length; i += 1) {
    parts.push(cuts[i] - cuts[i - 1] + 1);
  }

  // Shuffle so amounts are not ordered by split position.
  for (let i = parts.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [parts[i], parts[j]] = [parts[j], parts[i]];
  }

  return parts;
}

export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function formatBdt(amount: number) {
  return new Intl.NumberFormat("bn-BD").format(amount);
}

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/**
 * Deterministic Bengali numeral formatter with Indian-style (lakh) grouping.
 * Unlike Intl.NumberFormat, this produces byte-identical output on the server
 * and in every browser — safe to render during SSR without hydration drift.
 */
export function toBnNumber(value: number): string {
  const n = Math.round(Math.abs(value));
  const digits = String(n);
  let grouped: string;
  if (digits.length > 3) {
    const last3 = digits.slice(-3);
    let rest = digits.slice(0, -3);
    const parts: string[] = [];
    while (rest.length > 2) {
      parts.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest.length) parts.unshift(rest);
    grouped = `${parts.join(",")},${last3}`;
  } else {
    grouped = digits;
  }
  return grouped.replace(/[0-9]/g, (d) => BENGALI_DIGITS[Number(d)]);
}

/** Round to a friendly denomination so wheel labels look natural. */
export function niceRound(n: number) {
  if (n >= 1000) return Math.round(n / 100) * 100;
  if (n >= 200) return Math.round(n / 50) * 50;
  if (n >= 50) return Math.round(n / 10) * 10;
  if (n >= 20) return Math.round(n / 5) * 5;
  return Math.max(1, Math.round(n)); // small pots keep exact integers (1, 2, 3…)
}

/** Fixed index of the dazzling JACKPOT segment (shows the full pot). */
export const JACKPOT_INDEX = 2;

/** Number of segments on the wheel. */
export const WHEEL_SEGMENTS = 10;

/** Pick up to `n` values spread evenly across the sorted range of `arr`. */
function pickSpread(arr: number[], n: number): number[] {
  const sorted = [...arr].sort((a, b) => a - b);
  if (sorted.length <= n) return sorted;
  const out: number[] = [];
  for (let i = 0; i < n; i += 1) {
    out.push(sorted[Math.round((i * (sorted.length - 1)) / (n - 1))]);
  }
  return out;
}

/**
 * Build the spin-wheel labels as a MIX of two kinds of values:
 *
 *  • REAL — actual amounts still up for grabs (`realValues` = the session's
 *           pending amounts from the server). Shown exactly (no rounding), so
 *           when the wheel lands on the won amount it's a value already on the
 *           wheel — nothing looks rigged.
 *  • FAKE — big enticing fractions of the whole pot, up to the JACKPOT (the
 *           full pot) — there purely to make the wheel exciting.
 *
 * Slots are interleaved so small real numbers and big fake numbers sit side by
 * side. Pass the pot `total` and the list of real available `realValues`.
 */
export function buildWheelSegments(total: number, realValues: number[] = []) {
  const safeTotal = Math.max(total, 1);
  const clampFake = (n: number) => Math.min(Math.max(niceRound(n), 1), safeTotal);

  const reals = pickSpread(
    realValues.filter((v) => Number.isFinite(v) && v >= 1 && v <= safeTotal),
    5
  );
  const fakeMults = [0.85, 0.65, 0.45, 0.7, 0.55];

  // r = real value, f = fake high value, J = jackpot (full pot)
  const kinds = ["r", "f", "J", "r", "f", "r", "f", "r", "f", "r"] as const;
  let ri = 0;
  let fi = 0;

  return kinds.map((k, i) => {
    if (i === JACKPOT_INDEX) return safeTotal;
    if (k === "r") {
      if (reals.length) return reals[ri++ % reals.length]; // exact real amount
      return clampFake(safeTotal * 0.2); // fallback before data loads
    }
    return clampFake(safeTotal * fakeMults[fi++ % fakeMults.length]);
  });
}
