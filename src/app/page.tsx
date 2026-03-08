"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CreateResponse = {
  sessionId: string;
  shareUrl: string;
  creatorUrl: string;
  message?: string;
};

type SavedSession = {
  sessionId: string;
  organizerName: string;
  totalAmount: number;
  peopleCount: number;
  createdAt: string;
};

const LS_KEY = "eid_salami_my_sessions";

function loadSavedSessions(): SavedSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as SavedSession[]) : [];
  } catch {
    return [];
  }
}

function saveSession(session: SavedSession) {
  const existing = loadSavedSessions();
  existing.unshift(session);
  localStorage.setItem(LS_KEY, JSON.stringify(existing));
}

function bnNumber(value: number) {
  return new Intl.NumberFormat("bn-BD").format(value);
}

export default function HomePage() {
  const [organizerName, setOrganizerName] = useState("");
  const [totalAmount, setTotalAmount] = useState(1000);
  const [peopleCount, setPeopleCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CreateResponse | null>(null);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  useEffect(() => {
    setSavedSessions(loadSavedSessions());
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizerName,
          totalAmount,
          peopleCount,
        }),
      });

      const data = (await response.json()) as CreateResponse;
      if (!response.ok) {
        throw new Error(data.message || "সেশন তৈরি করা যায়নি");
      }

      setResult(data);

      const newSaved: SavedSession = {
        sessionId: data.sessionId,
        organizerName,
        totalAmount,
        peopleCount,
        createdAt: new Date().toISOString(),
      };
      saveSession(newSaved);
      setSavedSessions(loadSavedSessions());
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "একটি সমস্যা হয়েছে, আবার চেষ্টা করুন।"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-wrap">
      <div className="hero-badge">🌙 Eid Mubarak • সালামি চাকা</div>
      <h1 className="hero-title">ঈদ সালামি ভাগ করুন আনন্দে</h1>
      <p className="hero-desc">
        টার্গেট সালামির অ্যামাউন্ট এবং কতজনকে দিবেন সেট করুন। সিস্টেম র‌্যান্ডমভাবে
        অ্যামাউন্ট ভাগ করবে, একটি শেয়ার লিংক তৈরি হবে, আর সবাই স্পিন করে নিজের সালামি
        জিতবে।
      </p>

      <div className="ornament">☪</div>

      <section className="grid-2">
        <article className="panel sparkle glow-pulse">
          <h2>নতুন সালামি সেশন তৈরি করুন</h2>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <label htmlFor="organizer">আপনার নাম</label>
              <input
                id="organizer"
                value={organizerName}
                onChange={(event) => setOrganizerName(event.target.value)}
                placeholder="যেমন: মামা, বড় ভাই, আব্বু"
              />
            </div>

            <div className="form-row">
              <label htmlFor="amount">মোট সালামি টার্গেট (টাকা)</label>
              <input
                id="amount"
                type="number"
                min={1}
                value={totalAmount}
                onChange={(event) => setTotalAmount(Number(event.target.value))}
              />
            </div>

            <div className="form-row">
              <label htmlFor="people">কতজন মানুষ</label>
              <input
                id="people"
                type="number"
                min={1}
                value={peopleCount}
                onChange={(event) => setPeopleCount(Number(event.target.value))}
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "তৈরি হচ্ছে..." : "🎁 সালামি লিংক তৈরি করুন"}
            </button>
          </form>

          <p className="status">{error}</p>

          {result && (
            <div className="panel" style={{ marginTop: "1rem" }}>
              <p style={{ marginTop: 0 }}>✅ লিংক তৈরি হয়েছে। এখন শেয়ার করুন:</p>
              <input value={result.shareUrl} readOnly style={{ width: "100%" }} />
              <div className="row" style={{ marginTop: "0.7rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigator.clipboard.writeText(result.shareUrl)}
                >
                  লিংক কপি
                </button>
                <Link className="btn btn-primary" href={`/created/${result.sessionId}`}>
                  ড্যাশবোর্ডে যান
                </Link>
              </div>
            </div>
          )}
        </article>

        <article className="panel stagger">
          <h3>কিভাবে কাজ করে?</h3>
          <div className="info-list">
            <div className="info-item">🌙 মোট অ্যামাউন্ট দিন (যেমন ১০০০ টাকা)</div>
            <div className="info-item">👥 মোট মানুষ দিন (যেমন ৫ জন)</div>
            <div className="info-item">🎲 সিস্টেম র‌্যান্ডম ভাগ করবে, মোট যোগফল ঠিক থাকবে</div>
            <div className="info-item">🎰 প্রতিটি ব্যক্তি স্পিন করে একটি ইউনিক সালামি পাবে</div>
            <div className="info-item">🎁 কার্ড ডাউনলোড/শেয়ার করে ভাইরাল করুন</div>
          </div>

          <p style={{ marginTop: "1rem" }} className="text-muted">
            উদাহরণ: ১০০০ টাকা, ৫ জন হলে ফল হতে পারে ১০০, ৫০০, ৩০০, ৯০, ১০।
          </p>
        </article>
      </section>

      {savedSessions.length > 0 && (
        <section className="panel session-list" style={{ marginTop: "1.5rem" }}>
          <h3>📂 আমার সেশনগুলো</h3>
          <p className="text-muted" style={{ margin: "0.3rem 0 0.8rem", fontSize: "0.9rem" }}>
            আপনার তৈরি করা সেশনগুলো এই ব্রাউজার থেকে দেখতে পারবেন।
          </p>
          {savedSessions.map((s) => (
            <Link
              key={s.sessionId}
              href={`/created/${s.sessionId}`}
              className="session-card"
            >
              <div className="session-card-info">
                <p style={{ fontWeight: 600, color: "var(--gold-200)" }}>
                  {s.organizerName || "নামহীন"} — ৳{bnNumber(s.totalAmount)}
                </p>
                <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                  {s.peopleCount} জন •{" "}
                  {new Date(s.createdAt).toLocaleDateString("bn-BD")}
                </p>
              </div>
              <span className="btn btn-secondary" style={{ padding: "0.5rem 0.9rem", fontSize: "0.85rem" }}>
                ড্যাশবোর্ড →
              </span>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
