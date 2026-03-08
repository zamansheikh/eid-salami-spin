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
  recipientName: string;
  amount: number;
  cardUrl: string;
  message?: string;
};

type SpunEntry = {
  claimId: string;
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
  const [error, setError] = useState("");
  const [alreadySpun, setAlreadySpun] = useState<SpunEntry | null>(null);

  useEffect(() => {
    params.then((value) => setSessionId(value.sessionId));
  }, [params]);

  // Check if already spun
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
      }
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

    if (!sessionId) {
      setError("সেশন আইডি পাওয়া যায়নি।");
      return;
    }

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
      setRotation((previous) => previous + spinRound);

      window.setTimeout(() => {
        setResult(claimData);

        // Save to localStorage so this person can't spin again
        setSpunData(sessionId, {
          claimId: claimData.claimId,
          recipientName: claimData.recipientName,
          amount: claimData.amount,
        });
        setAlreadySpun({
          claimId: claimData.claimId,
          recipientName: claimData.recipientName,
          amount: claimData.amount,
        });

        confetti({
          particleCount: 180,
          spread: 120,
          origin: { y: 0.6 },
        });
        setSpinning(false);
      }, 4200);
    } catch (spinError) {
      setSpinning(false);
      setError(
        spinError instanceof Error
          ? spinError.message
          : "একটি সমস্যা হয়েছে, আবার চেষ্টা করুন।"
      );
    }
  };

  // Already spun — show previous result
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
            <p>
              <b>{alreadySpun.recipientName}</b>, আপনার সালামি ছিল:
            </p>
            <div className="result-amount">৳ {bnNumber(alreadySpun.amount)}</div>
            <div className="row" style={{ justifyContent: "center", marginTop: "1rem" }}>
              <Link href={`/card/${alreadySpun.claimId}`} className="btn btn-primary">
                🎁 আপনার কার্ড দেখুন
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="main-wrap">
      <div className="hero-badge">🎁 Spin & Win</div>
      <h1 className="hero-title" style={{ fontSize: "clamp(1.8rem,5vw,3rem)" }}>
        ঈদ সালামি স্পিনার
      </h1>

      <div className="ornament">☪</div>

      <section className="grid-2">
        <article className="panel">
          <h2>স্পিন করার আগে</h2>
          {session && (
            <p className="text-muted" style={{ margin: "0 0 0.8rem", fontSize: "0.92rem" }}>
              <b style={{ color: "var(--gold-200)" }}>{session.organizerName}</b> আপনাকে সালামি
              দিচ্ছে!
            </p>
          )}
          <div className="form-row">
            <label htmlFor="name">আপনার নাম</label>
            <input
              id="name"
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
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

          {session && (
            <p className="status">
              বাকি: {bnNumber(session.remainingSlots)} জন, {bnNumber(session.remainingAmount)} টাকা
            </p>
          )}

          <p className="status" style={{ color: "#fca5a5" }}>{error}</p>

          {isEnded && (
            <p style={{ color: "#fca5a5", marginTop: "0.5rem" }}>
              দুঃখিত, এই সেশনের সব সালামি বিতরণ হয়ে গেছে।
            </p>
          )}
        </article>

        <article className="panel sparkle text-center">
          <div className="wheel-wrap">
            <div className="wheel-pointer" />
            <div className="wheel" style={{ transform: `rotate(${rotation}deg)` }} />
            <div className="wheel-center">Eid<br />Salami</div>
          </div>

          {result && (
            <div style={{ marginTop: "0.5rem" }}>
              <p style={{ marginBottom: 0 }}>
                মাশাআল্লাহ, <b style={{ color: "var(--gold-200)" }}>{result.recipientName}</b> জিতেছেন
              </p>
              <div className="result-amount">৳ {bnNumber(result.amount)}</div>
              <div className="row" style={{ justifyContent: "center", marginTop: "0.6rem" }}>
                <Link href={`/card/${result.claimId}`} className="btn btn-primary">
                  🎁 গিফট কার্ড দেখুন
                </Link>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigator.clipboard.writeText(result.cardUrl)}
                >
                  কার্ড লিংক কপি
                </button>
              </div>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
