"use client";

import confetti from "canvas-confetti";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SpinWheel from "@/components/SpinWheel";
import ClaimSalamiModal from "@/components/ClaimSalamiModal";
import MosqueSkyline from "@/components/MosqueSkyline";
import { buildWheelSegments, JACKPOT_INDEX, WHEEL_SEGMENTS, toBnNumber } from "@/lib/utils";

/** Decelerating vibration pattern that mimics the wheel slowing down. */
function decelTickPattern() {
  const pattern: number[] = [];
  let gap = 40;
  let elapsed = 0;
  while (elapsed < 4000) {
    pattern.push(16, Math.round(gap));
    elapsed += 16 + gap;
    gap = Math.min(gap * 1.16, 420);
  }
  return pattern;
}

type SessionResponse = {
  sessionId: string;
  organizerName: string;
  totalAmount: number;
  peopleCount: number;
  remainingAmount: number;
  remainingSlots: number;
  pendingAmounts?: number[];
  message?: string;
};

type ClaimResponse = {
  claimId: string;
  claimToken: string;
  recipientName: string;
  amount: number;
  cardUrl: string;
  message?: string;
};

type SpunEntry = {
  claimId: string;
  claimToken: string;
  recipientName: string;
  amount: number;
};

const SPUN_KEY = "eid_salami_spun";

function bnNumber(value: number) {
  return new Intl.NumberFormat("bn-BD").format(value);
}

function getSpunData(sessionId: string): SpunEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SPUN_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, SpunEntry>;
    return map[sessionId] || null;
  } catch {
    return null;
  }
}

function setSpunData(sessionId: string, entry: SpunEntry) {
  try {
    const raw = localStorage.getItem(SPUN_KEY);
    const map: Record<string, SpunEntry> = raw ? JSON.parse(raw) : {};
    map[sessionId] = entry;
    localStorage.setItem(SPUN_KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}

// ── Reusable gift-card visual (same look as the full card page) ──
function GiftCardView({
  recipientName,
  organizerName,
  amount,
}: {
  recipientName: string;
  organizerName: string;
  amount: number;
}) {
  return (
    <div className="card-v2" style={{ width: "100%", margin: "0 0 1.1rem" }}>
      <div className="card-v2-header" style={{ padding: "1.3rem 1.5rem 0.8rem" }}>
        <div className="card-v2-moon" aria-hidden="true">🌙</div>
        <p className="card-v2-subtitle">Eid Mubarak</p>
        <h2 className="card-v2-heading">সালামি বিজয়ী</h2>
      </div>

      <div className="card-v2-amount-wrap" style={{ padding: "1rem 1rem 0.8rem" }}>
        <span className="card-v2-currency">৳</span>
        <span className="card-v2-amount">{bnNumber(amount)}</span>
      </div>

      <div className="card-v2-details" style={{ paddingBottom: "1.1rem" }}>
        <div className="card-v2-row">
          <span className="card-v2-label">প্রাপক</span>
          <span className="card-v2-value">{recipientName}</span>
        </div>
        <div className="card-v2-divider" />
        <div className="card-v2-row">
          <span className="card-v2-label">দিয়েছেন</span>
          <span className="card-v2-value">{organizerName}</span>
        </div>
      </div>

      {/* golden mosque horizon at the foot of the card */}
      <MosqueSkyline className="card-v2-skyline" />
    </div>
  );
}

// ── Congratulations Modal — shows the gift card directly ─────────
function CongratsModal({
  result,
  organizerName,
  onClaim,
  onClose,
}: {
  result: ClaimResponse;
  organizerName: string;
  onClaim: () => void;
  onClose: () => void;
}) {
  const cardHref = `/card/${result.claimId}?t=${result.claimToken}`;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(3, 20, 15, 0.85)",
        backdropFilter: "blur(6px)",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(440px, 94vw)",
          maxHeight: "94vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: 28,
          background: "linear-gradient(165deg, #052a22 0%, #0a4a3f 50%, #073d33 100%)",
          border: "2px solid rgba(212,168,83,0.5)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(212,168,83,0.12)",
          overflow: "hidden",
          animation: "fadeUp 0.4s ease-out",
        }}
      >
        {/* gold top strip */}
        <div style={{ height: 5, background: "linear-gradient(90deg,#92700a,#fcd34d,#92700a)", flexShrink: 0 }} />

        <div style={{ padding: "1.4rem 1.3rem 1.3rem", overflowY: "auto", textAlign: "center" }}>
          {/* congrats badge */}
          <div style={{
            display: "inline-block",
            padding: "0.4rem 1.2rem",
            borderRadius: 999,
            background: "rgba(212,168,83,0.12)",
            border: "1px solid rgba(212,168,83,0.35)",
            color: "#fde68a",
            fontSize: "0.95rem",
            marginBottom: "1rem",
          }}>
            🌙 মাশাআল্লাহ! কংগ্র্যাটস, {result.recipientName}!
          </div>

          {/* the gift card itself */}
          <GiftCardView
            recipientName={result.recipientName}
            organizerName={organizerName}
            amount={result.amount}
          />

          {/* actions */}
          <Link
            href={cardHref}
            className="btn btn-primary"
            style={{ width: "100%", fontSize: "1.05rem", padding: "0.95rem", marginBottom: "0.6rem" }}
          >
            🎁 গিফট কার্ড খুলুন
          </Link>

          <button
            type="button"
            onClick={onClaim}
            className="btn btn-secondary"
            style={{
              width: "100%",
              fontSize: "1rem",
              marginBottom: "0.7rem",
              borderColor: "rgba(52,211,153,0.45)",
              color: "#6ee7b7",
            }}
          >
            💸 সালামি দাবি করুন
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: 0,
              color: "rgba(255,255,255,0.45)",
              fontSize: "0.85rem",
              cursor: "pointer",
              width: "100%",
              padding: "0.2rem",
            }}
          >
            পরে দেখবো
          </button>
        </div>

        {/* gold bottom strip */}
        <div style={{ height: 5, background: "linear-gradient(90deg,#92700a,#fcd34d,#92700a)", flexShrink: 0 }} />
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function SpinPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const [sessionId, setSessionId] = useState("");
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<ClaimResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [alreadySpun, setAlreadySpun] = useState<SpunEntry | null>(null);
  const [segments, setSegments] = useState<number[]>(
    () => buildWheelSegments(1000, [200, 100, 300, 50, 150])
  );
  const [winningIndex, setWinningIndex] = useState<number | null>(null);
  const [claimTarget, setClaimTarget] = useState<{ claimId: string; claimToken: string } | null>(null);

  useEffect(() => {
    params.then((value) => setSessionId(value.sessionId));
  }, [params]);

  useEffect(() => {
    if (!sessionId) return;
    const prev = getSpunData(sessionId);
    if (prev) setAlreadySpun(prev);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    const load = async () => {
      const response = await fetch(`/api/sessions/${sessionId}`, { cache: "no-store" });
      const data = (await response.json()) as SessionResponse;
      if (response.ok) {
        setSession(data);
        setSegments(buildWheelSegments(data.totalAmount, data.pendingAmounts ?? []));
      }
    };
    load();
  }, [sessionId]);

  const isEnded = useMemo(() => (session ? session.remainingSlots <= 0 : false), [session]);

  const spinAndClaim = async () => {
    // One spin per person — never allow a second claim once one is recorded.
    if (alreadySpun || result || spinning) return;

    setError("");
    setResult(null);
    setWinningIndex(null);

    if (!recipientName.trim()) {
      setError("দয়া করে আপনার নাম লিখুন।");
      return;
    }
    if (!sessionId) return;

    setSpinning(true);

    try {
      const claimResponse = await fetch(`/api/sessions/${sessionId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientName }),
      });

      const claimData = (await claimResponse.json()) as ClaimResponse;

      if (!claimResponse.ok) {
        throw new Error(claimData.message || "স্পিন ব্যর্থ হয়েছে");
      }

      // The won amount is one of the real pending values already shown on the
      // wheel — so prefer landing on the segment that already displays it (no
      // visible change). Only if it isn't currently on the wheel do we inject
      // it into a non-jackpot slot. Either way the pointer stops on the real
      // won value.
      let winIdx = segments.findIndex(
        (v, idx) => v === claimData.amount && idx !== JACKPOT_INDEX
      );
      if (winIdx === -1) {
        winIdx = Math.floor(Math.random() * WHEEL_SEGMENTS);
        if (winIdx === JACKPOT_INDEX) winIdx = (winIdx + 1) % WHEEL_SEGMENTS;
        setSegments((prev) => {
          const next = [...prev];
          next[winIdx] = claimData.amount;
          return next;
        });
      }

      const segAngle = 360 / WHEEL_SEGMENTS;
      const centerLocal = winIdx * segAngle + segAngle / 2;
      const desiredMod = (360 - (centerLocal % 360)) % 360;
      setRotation((prev) => {
        const currentMod = ((prev % 360) + 360) % 360;
        let delta = desiredMod - currentMod;
        if (delta < 0) delta += 360;
        return prev + 360 * 5 + delta;
      });

      // Haptic: decelerating ticks while the wheel slows.
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(decelTickPattern());
      }

      window.setTimeout(() => {
        setResult(claimData);
        setWinningIndex(winIdx);
        setShowModal(true);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([0, 90, 50, 180]);
        }

        setSpunData(sessionId, {
          claimId: claimData.claimId,
          claimToken: claimData.claimToken,
          recipientName: claimData.recipientName,
          amount: claimData.amount,
        });
        setAlreadySpun({
          claimId: claimData.claimId,
          claimToken: claimData.claimToken,
          recipientName: claimData.recipientName,
          amount: claimData.amount,
        });

        // Persist token so CardClient can verify ownership across page loads
        localStorage.setItem(`eid_claim_token_${claimData.claimId}`, claimData.claimToken);

        confetti({ particleCount: 200, spread: 130, origin: { y: 0.55 } });
        setTimeout(() => confetti({ particleCount: 100, angle: 60, spread: 80, origin: { x: 0 } }), 400);
        setTimeout(() => confetti({ particleCount: 100, angle: 120, spread: 80, origin: { x: 1 } }), 600);

        setSpinning(false);
      }, 4200);
    } catch (spinError) {
      setSpinning(false);
      setError(
        spinError instanceof Error ? spinError.message : "একটি সমস্যা হয়েছে, আবার চেষ্টা করুন।"
      );
    }
  };

  // Already spun screen
  if (alreadySpun && !result) {
    return (
      <main className="main-wrap">
        <div className="hero-badge">🎁 Eid Salami</div>
        <h1 className="hero-title" style={{ fontSize: "clamp(1.8rem,5vw,3rem)" }}>
          ঈদ সালামি স্পিনার
        </h1>
        <div className="ornament">☪</div>
        <section className="panel glow-pulse text-center" style={{ maxWidth: 440, margin: "1.5rem auto" }}>
          <h2 style={{ color: "var(--gold-200)", marginBottom: "0.4rem" }}>
            আপনি ইতিমধ্যে স্পিন করেছেন!
          </h2>
          <p className="text-muted" style={{ marginBottom: "1.1rem", fontSize: "0.9rem" }}>
            একজন ব্যক্তি শুধুমাত্র একবার স্পিন করতে পারে। এটি আপনার সালামি কার্ড:
          </p>

          <GiftCardView
            recipientName={alreadySpun.recipientName}
            organizerName={session?.organizerName ?? ""}
            amount={alreadySpun.amount}
          />

          <Link
            href={`/card/${alreadySpun.claimId}?t=${alreadySpun.claimToken}`}
            className="btn btn-primary"
            style={{ width: "100%", fontSize: "1.05rem", padding: "0.95rem", marginBottom: "0.6rem" }}
          >
            🎁 গিফট কার্ড খুলুন
          </Link>
          <button
            type="button"
            onClick={() =>
              setClaimTarget({ claimId: alreadySpun.claimId, claimToken: alreadySpun.claimToken })
            }
            className="btn btn-secondary"
            style={{
              width: "100%",
              fontSize: "1rem",
              borderColor: "rgba(52,211,153,0.45)",
              color: "#6ee7b7",
            }}
          >
            💸 সালামি দাবি করুন
          </button>
        </section>

        {claimTarget && (
          <ClaimSalamiModal
            claimId={claimTarget.claimId}
            claimToken={claimTarget.claimToken}
            onClose={() => setClaimTarget(null)}
          />
        )}
      </main>
    );
  }

  return (
    <>
      {showModal && result && (
        <CongratsModal
          result={result}
          organizerName={session?.organizerName ?? ""}
          onClaim={() =>
            setClaimTarget({ claimId: result.claimId, claimToken: result.claimToken })
          }
          // Dismissing returns to the "already spun" screen (card + claim
          // buttons) — never back to the spin form, so a person can't re-spin.
          onClose={() => { setShowModal(false); setResult(null); }}
        />
      )}

      {claimTarget && (
        <ClaimSalamiModal
          claimId={claimTarget.claimId}
          claimToken={claimTarget.claimToken}
          onClose={() => setClaimTarget(null)}
        />
      )}

      <main className="main-wrap">
        <div className="hero-badge">🎁 Spin & Win</div>
        <h1 className="hero-title" style={{ fontSize: "clamp(1.8rem,5vw,3rem)" }}>
          ঈদ সালামি স্পিনার
        </h1>

        <div className="ornament">☪</div>

        <section className="grid-2">
          {/* ── Left panel ──────────────────────────────── */}
          <article className="panel">
            {session && (
              <p className="text-muted" style={{ margin: "0 0 1rem", fontSize: "0.92rem" }}>
                <b style={{ color: "var(--gold-200)" }}>{session.organizerName}</b> আপনাকে সালামি দিচ্ছে!
              </p>
            )}

            {/* Jackpot teaser */}
            {session && !isEnded && (
              <div className="jackpot-teaser">
                <span className="jackpot-pill">🏆 জ্যাকপট</span>
                <p style={{ margin: "0.5rem 0 0.1rem", color: "var(--violet-300)", fontSize: "0.85rem" }}>
                  ভাগ্য সাথে থাকলে সর্বোচ্চ জিততে পারেন
                </p>
                <div className="jackpot-amount">৳ {bnNumber(session.totalAmount)}</div>
                <p style={{ margin: "0.3rem 0 0", color: "var(--emerald-300)", fontSize: "0.82rem" }}>
                  🎡 চাকা ঘুরিয়ে তোমার ভাগ্য পরীক্ষা করো!
                </p>
              </div>
            )}

            <div className="form-row">
              <label htmlFor="name">আপনার নাম</label>
              <input
                id="name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="আপনার নাম লিখুন"
                disabled={spinning || isEnded || !!alreadySpun || !!result}
              />
            </div>

            <button
              type="button"
              className="btn btn-primary"
              disabled={spinning || isEnded || !!alreadySpun || !!result}
              onClick={spinAndClaim}
              style={{ width: "100%" }}
            >
              {spinning ? "🎰 চাকা ঘুরছে..." : "🎰 স্পিন করে সালামি জিতুন"}
            </button>

            {error && <p style={{ color: "#fca5a5", marginTop: "0.7rem", fontSize: "0.95rem" }}>{error}</p>}

            {isEnded && (
              <p style={{ color: "#fca5a5", marginTop: "0.5rem" }}>
                দুঃখিত, এই সেশনের সব সালামি বিতরণ হয়ে গেছে।
              </p>
            )}
          </article>

          {/* ── Right panel — wheel ──────────────────────── */}
          <article className="panel sparkle text-center">
            <SpinWheel
              labels={segments.map((s) => `৳${toBnNumber(s)}`)}
              rotation={rotation}
              spinning={spinning}
              winningIndex={winningIndex}
              jackpotIndex={JACKPOT_INDEX}
            />

            {result && (
              <div style={{ marginTop: "0.8rem" }}>
                <p style={{ marginBottom: 0 }}>
                  মাশাআল্লাহ, <b style={{ color: "var(--gold-200)" }}>{result.recipientName}</b> জিতেছেন
                </p>
                <div className="result-amount">৳ {bnNumber(result.amount)}</div>
                <Link href={`/card/${result.claimId}`} className="btn btn-primary" style={{ marginTop: "0.6rem" }}>
                  🎁 গিফট কার্ড খুলুন
                </Link>
              </div>
            )}
          </article>
        </section>
      </main>
    </>
  );
}
