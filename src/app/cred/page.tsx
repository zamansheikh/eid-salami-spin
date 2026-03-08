"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SessionRow = {
  sessionId: string;
  organizerName: string;
  totalAmount: number;
  peopleCount: number;
  remainingSlots: number;
  remainingAmount: number;
  claimedCount: number;
  createdAt: string;
};

function bnNumber(value: number) {
  return new Intl.NumberFormat("bn-BD").format(value);
}

const SESSION_KEY = "admin_verified_pin";

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState("");
  const [autoLogging, setAutoLogging] = useState(true);

  // Auto-login from saved PIN in localStorage on first mount
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(SESSION_KEY) : null;
    if (!saved) { setAutoLogging(false); return; }
    fetch("/api/admin/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: saved }),
    })
      .then((r) => r.json())
      .then((data: { sessions?: SessionRow[] }) => {
        if (data.sessions) setSessions(data.sessions);
        else { localStorage.removeItem(SESSION_KEY); }
      })
      .catch(() => localStorage.removeItem(SESSION_KEY))
      .finally(() => setAutoLogging(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = (await res.json()) as { sessions?: SessionRow[]; message?: string };

      if (!res.ok) {
        setError(data.message ?? "Invalid PIN.");
        return;
      }

      // Cache verified pin in localStorage so page refresh restores session
      localStorage.setItem(SESSION_KEY, pin);
      setSessions(data.sessions ?? []);
    } catch {
      setError("Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    const cached = typeof window !== "undefined" ? localStorage.getItem(SESSION_KEY) : null;
    if (!cached) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: cached }),
      });
      const data = (await res.json()) as { sessions?: SessionRow[] };
      if (res.ok) setSessions(data.sessions ?? []);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1800);
  };

  const filtered = (sessions ?? []).filter((s) =>
    !search ||
    s.organizerName.toLowerCase().includes(search.toLowerCase()) ||
    s.sessionId.toLowerCase().includes(search.toLowerCase())
  );

  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "https://eid-salami-for-u.vercel.app";

  // ── PIN gate ────────────────────────────────────────────────
  if (autoLogging) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main, #050e0a)" }}>
        <p style={{ color: "#6ee7b7" }}>Loading...</p>
      </main>
    );
  }

  if (!sessions) {
    return (
      <main style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "var(--bg-main, #050e0a)",
      }}>
        <div style={{
          width: "min(360px,90vw)",
          borderRadius: 20,
          background: "linear-gradient(165deg,#062e28,#0a4a3f)",
          border: "1px solid rgba(212,168,83,0.3)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          padding: "2rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.3rem" }}>🔐</div>
          <h1 style={{ color: "#fde68a", margin: "0 0 0.3rem", fontSize: "1.3rem" }}>Admin Access</h1>
          <p style={{ color: "#6ee7b7", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            Enter your PIN to continue
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••"
              autoFocus
              style={{
                width: "100%",
                textAlign: "center",
                fontSize: "1.5rem",
                letterSpacing: "0.4rem",
                marginBottom: "0.8rem",
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Enter"}
            </button>
          </form>
          {error && (
            <p style={{ color: "#fca5a5", marginTop: "0.8rem", fontSize: "0.9rem" }}>{error}</p>
          )}
        </div>
      </main>
    );
  }

  // ── Dashboard ───────────────────────────────────────────────
  return (
    <main className="main-wrap">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.6rem", marginBottom: "0.5rem" }}>
        <div>
          <div className="hero-badge" style={{ display: "inline-block" }}>🛡 Super Admin</div>
          <h1 className="hero-title" style={{ fontSize: "clamp(1.4rem,4vw,2.2rem)", marginTop: "0.4rem" }}>
            All Sessions
          </h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? "..." : "⟳ Refresh"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: "0.85rem", padding: "0.5rem 1rem", color: "#fca5a5" }}
            onClick={() => { localStorage.removeItem(SESSION_KEY); setSessions(null); setPin(""); }}
          >
            Lock
          </button>
        </div>
      </div>

      {/* stats strip */}
      <div style={{
        display: "flex",
        gap: "0.7rem",
        flexWrap: "wrap",
        marginBottom: "1.2rem",
      }}>
        {[
          { label: "Total Sessions", value: sessions.length },
          { label: "Total Claimed", value: sessions.reduce((a, s) => a + s.claimedCount, 0) },
          { label: "Total Amount", value: `৳${bnNumber(sessions.reduce((a, s) => a + s.totalAmount, 0))}` },
        ].map((stat) => (
          <div key={stat.label} style={{
            flex: "1 1 120px",
            background: "rgba(212,168,83,0.07)",
            border: "1px solid rgba(212,168,83,0.2)",
            borderRadius: 12,
            padding: "0.7rem 1rem",
            textAlign: "center",
          }}>
            <div style={{ color: "#fde68a", fontWeight: 700, fontSize: "1.1rem" }}>{stat.value}</div>
            <div style={{ color: "#6ee7b7", fontSize: "0.75rem" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by organizer name or session ID…"
        style={{ width: "100%", marginBottom: "1rem", fontSize: "0.9rem" }}
      />

      <p style={{ color: "#6ee7b7", fontSize: "0.82rem", marginBottom: "0.7rem" }}>
        Showing {filtered.length} of {sessions.length} sessions
      </p>

      {/* table wrapper */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(212,168,83,0.25)", color: "#fde68a" }}>
              {["#", "Organizer", "Amount", "People", "Claimed", "Remaining", "Created", "Links"].map((h) => (
                <th key={h} style={{ padding: "0.6rem 0.7rem", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, idx) => {
              const dashUrl = `${baseUrl}/created/${s.sessionId}`;
              const spinUrl = `${baseUrl}/s/${s.sessionId}`;
              const allDone = s.remainingSlots === 0;

              return (
                <tr
                  key={s.sessionId}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    background: idx % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
                  }}
                >
                  <td style={{ padding: "0.55rem 0.7rem", color: "#6ee7b7" }}>{idx + 1}</td>
                  <td style={{ padding: "0.55rem 0.7rem", color: "#f0fdf4", fontWeight: 600 }}>
                    {s.organizerName}
                  </td>
                  <td style={{ padding: "0.55rem 0.7rem", color: "#fde68a" }}>
                    ৳{bnNumber(s.totalAmount)}
                  </td>
                  <td style={{ padding: "0.55rem 0.7rem" }}>
                    {s.peopleCount}
                  </td>
                  <td style={{ padding: "0.55rem 0.7rem" }}>
                    <span style={{
                      background: allDone ? "rgba(74,222,128,0.15)" : "rgba(251,191,36,0.1)",
                      color: allDone ? "#4ade80" : "#fbbf24",
                      borderRadius: 6,
                      padding: "0.15rem 0.5rem",
                      fontSize: "0.8rem",
                    }}>
                      {s.claimedCount}/{s.peopleCount}
                    </span>
                  </td>
                  <td style={{ padding: "0.55rem 0.7rem", color: "#a7f3d0" }}>
                    ৳{bnNumber(s.remainingAmount)} / {s.remainingSlots} left
                  </td>
                  <td style={{ padding: "0.55rem 0.7rem", color: "#6ee7b7", whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—"}
                  </td>
                  <td style={{ padding: "0.55rem 0.7rem" }}>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      <Link
                        href={`/created/${s.sessionId}`}
                        className="btn btn-secondary"
                        style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                        target="_blank"
                      >
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                        onClick={() => copyText(dashUrl, `dash-${s.sessionId}`)}
                      >
                        {copied === `dash-${s.sessionId}` ? "✓" : "Copy"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", color: "#86efac" }}
                        onClick={() => copyText(spinUrl, `spin-${s.sessionId}`)}
                      >
                        {copied === `spin-${s.sessionId}` ? "✓ Spin" : "Spin URL"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p style={{ color: "#6ee7b7", textAlign: "center", padding: "2rem" }}>
            No sessions found.
          </p>
        )}
      </div>
    </main>
  );
}
