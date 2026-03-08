"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ClaimSummary = {
  claimId: string;
  recipientName: string;
  amount: number;
  claimedAt: string;
};

type SessionResponse = {
  sessionId: string;
  organizerName: string;
  totalAmount: number;
  peopleCount: number;
  remainingAmount: number;
  remainingSlots: number;
  claims: ClaimSummary[];
  message?: string;
};

function bnNumber(value: number) {
  return new Intl.NumberFormat("bn-BD").format(value);
}

export default function CreatedPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const [sessionId, setSessionId] = useState("");
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then((value) => setSessionId(value.sessionId));
  }, [params]);

  useEffect(() => {
    if (!sessionId) return;

    const load = async () => {
      const response = await fetch(`/api/sessions/${sessionId}`, { cache: "no-store" });
      const data = (await response.json()) as SessionResponse;
      if (!response.ok) {
        setError(data.message || "ডেটা আনা যায়নি");
        return;
      }

      setSession(data);
      setError("");
    };

    load();
    const intervalRef = setInterval(load, 3500);

    return () => clearInterval(intervalRef);
  }, [sessionId]);

  const shareUrl = useMemo(() => {
    if (!sessionId || typeof window === "undefined") return "";
    return `${window.location.origin}/s/${sessionId}`;
  }, [sessionId]);

  if (!sessionId) {
    return <main className="main-wrap">লোড হচ্ছে...</main>;
  }

  return (
    <main className="main-wrap">
      <div className="hero-badge">📊 Creator Dashboard</div>
      <h1 className="hero-title" style={{ fontSize: "clamp(1.8rem,5vw,3rem)" }}>
        সালামি ড্যাশবোর্ড
      </h1>

      <div className="ornament">☪</div>

      <section className="grid-2">
        <article className="panel glow-pulse">
          <h2>শেয়ার লিংক</h2>
          <input value={shareUrl} readOnly style={{ width: "100%" }} />
          <div className="row" style={{ marginTop: "0.8rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigator.clipboard.writeText(shareUrl)}
            >
              কপি লিংক
            </button>
            <Link href={`/s/${sessionId}`} className="btn btn-primary">
              স্পিন পেইজ দেখুন
            </Link>
          </div>
          <p className="status">{error}</p>
        </article>

        <article className="panel">
          <h2>বর্তমান অবস্থা</h2>
          {!session ? (
            <p>লোড হচ্ছে...</p>
          ) : (
            <div className="info-list">
              <div className="info-item">
                আয়োজক: <b>{session.organizerName}</b>
              </div>
              <div className="info-item">
                মোট টার্গেট: <b>{bnNumber(session.totalAmount)} টাকা</b>
              </div>
              <div className="info-item">
                বাকি টাকা: <b>{bnNumber(session.remainingAmount)} টাকা</b>
              </div>
              <div className="info-item">
                বাকি মানুষ: <b>{bnNumber(session.remainingSlots)} জন</b>
              </div>
            </div>
          )}
        </article>
      </section>

      <section className="panel sparkle" style={{ marginTop: "1.5rem" }}>
        <h3>🏆 যারা ইতিমধ্যে সালামি জিতেছে</h3>
        {!session || session.claims.length === 0 ? (
          <p>এখনও কেউ স্পিন করেনি।</p>
        ) : (
          <div className="info-list">
            {session.claims
              .slice()
              .reverse()
              .map((claim) => (
                <div className="info-item" key={claim.claimId}>
                  <b>{claim.recipientName}</b> পেয়েছে <b>{bnNumber(claim.amount)} টাকা</b> •{" "}
                  <Link href={`/card/${claim.claimId}`}>কার্ড দেখুন</Link>
                </div>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}
