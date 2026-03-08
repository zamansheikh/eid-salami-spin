"use client";

import confetti from "canvas-confetti";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SessionResponse = {
  sessionId: string;
  organizerName: string;
  totalAmount: number;
  peopleCount: number;
  remainingAmount: number;
  remainingSlots: number;
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

// ── Congratulations Modal ────────────────────────────────────────
function CongratsModal({
  result,
  onClose,
}: {
  result: ClaimResponse;
  onClose: () => void;
}) {
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
          width: "min(460px, 94vw)",
          borderRadius: 28,
          background: "linear-gradient(165deg, #052a22 0%, #0a4a3f 50%, #073d33 100%)",
          border: "2px solid rgba(212,168,83,0.5)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(212,168,83,0.12)",
          overflow: "hidden",
          textAlign: "center",
          animation: "fadeUp 0.4s ease-out",
        }}
      >
        {/* gold top strip */}
        <div style={{ height: 5, background: "linear-gradient(90deg,#92700a,#fcd34d,#92700a)" }} />

        <div style={{ padding: "2rem 1.8rem 1.5rem" }}>
          {/* badge */}
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
            🌙 মাশাআল্লাহ! কংগ্র্যাটস!
          </div>

          {/* name */}
          <p style={{ margin: "0 0 0.3rem", color: "#a7f3d0", fontSize: "1.05rem" }}>
            <b style={{ color: "#fde68a" }}>{result.recipientName}</b>, আপনি জিতেছেন
          </p>

          {/* big amount */}
          <div style={{
            fontSize: "clamp(3.5rem, 14vw, 5.5rem)",
            fontWeight: 800,
            lineHeight: 1,
            background: "linear-gradient(135deg, #fde68a, #fcd34d, #fef3c7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: "0.4rem 0 1rem",
          }}>
            ৳{bnNumber(result.amount)}
          </div>

          {/* CTA — open gift card */}
          <Link
            href={`/card/${result.claimId}?t=${result.claimToken}`}
            className="btn btn-primary"
            style={{ width: "100%", fontSize: "1.1rem", padding: "1rem", marginBottom: "0.7rem" }}
          >
            🎁 গিফট কার্ড খুলুন
          </Link>

          {/* secondary */}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: "100%", fontSize: "0.95rem" }}
            onClick={onClose}
          >
            পরে দেখবো
          </button>
        </div>

        {/* gold bottom strip */}
        <div style={{ height: 5, background: "linear-gradient(90deg,#92700a,#fcd34d,#92700a)" }} />
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
      if (response.ok) setSession(data);
    };
    load();
  }, [sessionId]);

  const isEnded = useMemo(() => (session ? session.remainingSlots <= 0 : false), [session]);

  const spinAndClaim = async () => {
    setError("");
    setResult(null);

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

      const spinRound = 2160 + Math.floor(Math.random() * 360);
      setRotation((prev) => prev + spinRound);

      window.setTimeout(() => {
        setResult(claimData);
        setShowModal(true);

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
        <section className="panel glow-pulse text-center" style={{ maxWidth: 550, margin: "1.5rem auto" }}>
          <div className="already-spun">
            <h2>আপনি ইতিমধ্যে স্পিন করেছেন!</h2>
            <p className="text-muted" style={{ marginBottom: "0.8rem" }}>
              একজন ব্যক্তি শুধুমাত্র একবার স্পিন করতে পারে।
            </p>
            <p><b>{alreadySpun.recipientName}</b>, আপনার সালামি ছিল:</p>
            <div className="result-amount">৳ {bnNumber(alreadySpun.amount)}</div>
            <div className="row" style={{ justifyContent: "center", marginTop: "1rem" }}>
              <Link href={`/card/${alreadySpun.claimId}?t=${alreadySpun.claimToken}`} className="btn btn-primary">
                🎁 আপনার কার্ড দেখুন
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      {showModal && result && (
        <CongratsModal result={result} onClose={() => setShowModal(false)} />
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

            {/* Max amount teaser */}
            {session && !isEnded && (
              <div style={{
                textAlign: "center",
                padding: "1rem 0.5rem",
                marginBottom: "1rem",
                borderRadius: 16,
                background: "rgba(212,168,83,0.07)",
                border: "1px solid rgba(212,168,83,0.2)",
              }}>
                <p style={{ margin: "0 0 0.2rem", color: "var(--emerald-300)", fontSize: "0.85rem" }}>
                  বাকি আছে আরো! সর্বোচ্চ পেতে পারেন
                </p>
                <div style={{
                  fontSize: "clamp(2rem, 7vw, 3rem)",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, var(--gold-200), var(--gold-400))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 1.1,
                }}>
                  ৳ {bnNumber(session.totalAmount)}
                </div>
                <p style={{ margin: "0.3rem 0 0", color: "var(--emerald-300)", fontSize: "0.8rem" }}>
                  🍀 ভাগ্য চাকা ঘুরিয়ে দেখো!
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
                disabled={spinning || isEnded}
              />
            </div>

            <button
              type="button"
              className="btn btn-primary"
              disabled={spinning || isEnded}
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
            <div className="wheel-wrap">
              <div className="wheel-pointer" />
              <div className="wheel" style={{ transform: `rotate(${rotation}deg)` }} />
              <div className="wheel-center">Eid<br />Salami</div>
            </div>

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
