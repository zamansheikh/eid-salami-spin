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
