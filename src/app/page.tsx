"use client";

import Link from "next/link";
import { useState } from "react";

type CreateResponse = {
  sessionId: string;
  shareUrl: string;
  creatorUrl: string;
  message?: string;
};

export default function HomePage() {
  const [organizerName, setOrganizerName] = useState("");
  const [totalAmount, setTotalAmount] = useState(1000);
  const [peopleCount, setPeopleCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CreateResponse | null>(null);

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
        throw new Error(data.message || "সেশন তৈরি করা যায়নি");
      }

      setResult(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "একটি সমস্যা হয়েছে, আবার চেষ্টা করুন।"
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
        অ্যামাউন্ট ভাগ করবে, একটি শেয়ার লিংক তৈরি হবে, আর সবাই স্পিন করে নিজের সালামি
        জিতবে।
      </p>

      <section className="grid-2">
        <article className="panel sparkle">
          <h2>নতুন সালামি সেশন তৈরি করুন</h2>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <label htmlFor="organizer">আপনার নাম</label>
              <input
                id="organizer"
                value={organizerName}
                onChange={(event) => setOrganizerName(event.target.value)}
                placeholder="যেমন: মামা, বড় ভাই, আব্বু"
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
              {loading ? "তৈরি হচ্ছে..." : "সালামি লিংক তৈরি করুন"}
            </button>
          </form>

          <p className="status">{error}</p>

          {result && (
            <div className="panel" style={{ marginTop: "1rem" }}>
              <p style={{ marginTop: 0 }}>লিংক তৈরি হয়েছে। এখন শেয়ার করুন:</p>
              <input value={result.shareUrl} readOnly />
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

        <article className="panel">
          <h3>কিভাবে কাজ করে?</h3>
          <div className="info-list">
            <div className="info-item">১) মোট অ্যামাউন্ট দিন (যেমন ১০০০ টাকা)</div>
            <div className="info-item">২) মোট মানুষ দিন (যেমন ৫ জন)</div>
            <div className="info-item">
              ৩) সিস্টেম র‌্যান্ডম ভাগ করবে, কিন্তু মোট যোগফল ঠিক থাকবে
            </div>
            <div className="info-item">৪) প্রতিটি ব্যক্তি স্পিন করে একটি ইউনিক সালামি পাবে</div>
            <div className="info-item">৫) কার্ড ডাউনলোড/শেয়ার করে ভাইরাল করুন</div>
          </div>

          <p style={{ marginTop: "1rem", color: "#5c6677" }}>
            উদাহরণ: ১০০০ টাকা, ৫ জন হলে ফল হতে পারে ১০০, ৫০০, ৩০০, ৯০, ১০।
          </p>
        </article>
      </section>
    </main>
  );
}
