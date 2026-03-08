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

function bnNumber(value: number) {
  return new Intl.NumberFormat("bn-BD").format(value);
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

  useEffect(() => {
    params.then((value) => setSessionId(value.sessionId));
  }, [params]);

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
      setError("দয়া করে আপনার নাম লিখুন।");
      return;
    }

    if (!sessionId) {
      setError("সেশন আইডি পাওয়া যায়নি।");
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
        throw new Error(claimData.message || "স্পিন ব্যর্থ হয়েছে");
      }

      const spinRound = 2160 + Math.floor(Math.random() * 360);
      setRotation((previous) => previous + spinRound);

      window.setTimeout(() => {
        setResult(claimData);
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
          : "একটি সমস্যা হয়েছে, আবার চেষ্টা করুন।"
      );
    }
  };

  return (
    <main className="main-wrap">
      <div className="hero-badge">🎁 Spin & Win</div>
      <h1 className="hero-title" style={{ fontSize: "clamp(1.8rem,5vw,3rem)" }}>
        ঈদ সালামি স্পিনার
      </h1>

      <section className="grid-2">
        <article className="panel">
          <h2>স্পিন করার আগে</h2>
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
          >
            {spinning ? "চাকা ঘুরছে..." : "স্পিন করে সালামি জিতুন"}
          </button>

          {session && (
            <p className="status">
              বাকি: {bnNumber(session.remainingSlots)} জন, {bnNumber(session.remainingAmount)} টাকা
            </p>
          )}

          <p className="status">{error}</p>

          {isEnded && (
            <p style={{ color: "#b91c1c" }}>
              দুঃখিত, এই সেশনের সব সালামি বিতরণ হয়ে গেছে।
            </p>
          )}
        </article>

        <article className="panel sparkle" style={{ textAlign: "center" }}>
          <div className="wheel-wrap">
            <div className="wheel-pointer" />
            <div className="wheel" style={{ transform: `rotate(${rotation}deg)` }} />
            <div className="wheel-center">Eid Salami</div>
          </div>

          {result && (
            <div>
              <p style={{ marginBottom: 0 }}>
                মাশাআল্লাহ, <b>{result.recipientName}</b> জিতেছেন
              </p>
              <div className="result-amount">৳ {bnNumber(result.amount)}</div>
              <div className="row" style={{ justifyContent: "center" }}>
                <Link href={`/card/${result.claimId}`} className="btn btn-secondary">
                  গিফট কার্ড দেখুন
                </Link>
                <button
                  type="button"
                  className="btn btn-primary"
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
