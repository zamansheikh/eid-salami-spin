"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ClaimSummary = {
  claimId: string;
  recipientName: string;
  amount: number;
  claimedAt: string;
  paymentRequest?: {
    method: string;
    number: string;
    requestedAt: string;
  } | null;
};

type SessionResponse = {
  sessionId: string;
  organizerName: string;
  totalAmount: number;
  peopleCount: number;
  remainingAmount: number;
  remainingSlots: number;
  claims: ClaimSummary[];
  claimsTotal: number;
  claimedCount: number;
  message?: string;
};

const LS_KEY = "eid_salami_my_sessions";

type SavedSession = {
  sessionId: string;
  organizerName: string;
  totalAmount: number;
  peopleCount: number;
  createdAt: string;
};

function ensureSavedLocally(session: SessionResponse) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LS_KEY);
    const list: SavedSession[] = raw ? JSON.parse(raw) : [];
    if (list.some((s) => s.sessionId === session.sessionId)) return;
    list.unshift({
      sessionId: session.sessionId,
      organizerName: session.organizerName,
      totalAmount: session.totalAmount,
      peopleCount: session.peopleCount,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}

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
  const [spinLinkCopied, setSpinLinkCopied] = useState(false);
  const [dashLinkCopied, setDashLinkCopied] = useState(false);
  const [claimsPage, setClaimsPage] = useState(1);
  const CLAIMS_PER_PAGE = 10;

  // Session editing (organizer, budget, slots)
  const [editingBudget, setEditingBudget] = useState(false);
  const [newOrganizer, setNewOrganizer] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [newSlots, setNewSlots] = useState("");
  const [budgetSaving, setBudgetSaving] = useState(false);
  const [budgetError, setBudgetError] = useState("");
  const [budgetSuccess, setBudgetSuccess] = useState("");

  useEffect(() => {
    params.then((value) => setSessionId(value.sessionId));
  }, [params]);

  useEffect(() => {
    if (!sessionId) return;

    const load = async () => {
      const response = await fetch(
        `/api/sessions/${sessionId}?claimsPage=${claimsPage}&claimsLimit=${CLAIMS_PER_PAGE}`,
        { cache: "no-store" }
      );
      const data = (await response.json()) as SessionResponse;
      if (!response.ok) {
        setError(data.message || "Data fetch failed");
        return;
      }
      setSession(data);
      ensureSavedLocally(data);
      setError("");
    };

    load();
    const intervalRef = setInterval(load, 3500);
    return () => clearInterval(intervalRef);
  }, [sessionId, claimsPage]);

  const shareUrl = useMemo(() => {
    if (!sessionId || typeof window === "undefined") return "";
    return `${window.location.origin}/s/${sessionId}`;
  }, [sessionId]);

  const dashboardUrl = useMemo(() => {
    if (!sessionId || typeof window === "undefined") return "";
    return `${window.location.origin}/created/${sessionId}`;
  }, [sessionId]);

  const copySpinLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setSpinLinkCopied(true);
    setTimeout(() => setSpinLinkCopied(false), 2500);
  };

  const copyDashLink = () => {
    navigator.clipboard.writeText(dashboardUrl);
    setDashLinkCopied(true);
    setTimeout(() => setDashLinkCopied(false), 2500);
  };

  const saveBudget = async () => {
    setBudgetError("");
    setBudgetSuccess("");
    const organizer = newOrganizer.trim();
    const amount = Number(newBudget);
    const slots = Number(newSlots);
    if (!organizer) {
      setBudgetError("Organizer name cannot be empty.");
      return;
    }
    if (!amount || amount <= 0 || !Number.isInteger(amount)) {
      setBudgetError("Please enter a valid budget (whole number).");
      return;
    }
    if (!Number.isInteger(slots) || slots < 0) {
      setBudgetError("Please enter a valid number of remaining slots.");
      return;
    }
    setBudgetSaving(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizerName: organizer, newTotalAmount: amount, newRemainingSlots: slots }),
      });
      const data = await res.json() as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Update failed.");
      setBudgetSuccess("Updated successfully!");
      setEditingBudget(false);
      setNewOrganizer("");
      setNewBudget("");
      setNewSlots("");
      setTimeout(() => setBudgetSuccess(""), 3000);
    } catch (err) {
      setBudgetError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBudgetSaving(false);
    }
  };

  if (!sessionId) {
    return <main className="main-wrap">Loading...</main>;
  }

  const alreadyClaimed = session ? session.totalAmount - session.remainingAmount : 0;

  return (
    <main className="main-wrap">
      <div className="hero-badge">Creator Dashboard</div>
      <h1 className="hero-title" style={{ fontSize: "clamp(1.8rem,5vw,3rem)" }}>
        Salami Dashboard
      </h1>

      <div className="ornament">&#x262A;</div>

      {/* Highlighted spin/share link */}
      <div style={{
        background: "linear-gradient(135deg, rgba(6,78,59,0.8), rgba(4,120,87,0.5))",
        border: "2px solid rgba(52,211,153,0.4)",
        borderRadius: 16,
        padding: "1.1rem",
        marginBottom: "1.2rem",
        boxShadow: "0 0 30px rgba(52,211,153,0.08)",
      }}>
        <p style={{ margin: "0 0 0.4rem", color: "#6ee7b7", fontWeight: 700, fontSize: "0.95rem" }}>
          Share this link with friends — they spin to win!
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={shareUrl}
            readOnly
            style={{ flex: 1, minWidth: 0, fontWeight: 600, color: "#fde68a", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(52,211,153,0.3)" }}
          />
          <button type="button" className="btn btn-secondary" style={{ padding: "0.5rem 0.9rem", fontSize: "0.85rem", whiteSpace: "nowrap" }} onClick={copySpinLink}>
            {spinLinkCopied ? "Copied!" : "Copy"}
          </button>
          <Link href={`/s/${sessionId}`} className="btn btn-primary" style={{ fontSize: "0.85rem", padding: "0.5rem 0.9rem", whiteSpace: "nowrap" }}>
            View Spin Page
          </Link>
        </div>
      </div>

      <article className="panel">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
            <h2 style={{ margin: 0 }}>Status</h2>
            {session && !editingBudget && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem" }}
                onClick={() => {
                  setEditingBudget(true);
                  setNewOrganizer(session.organizerName);
                  setNewBudget(String(session.totalAmount));
                  setNewSlots(String(session.remainingSlots));
                  setBudgetError("");
                }}
              >
                Edit
              </button>
            )}
          </div>
          {!session ? (
            <p>Loading...</p>
          ) : (
            <div className="info-list">
              <div className="info-item">Organizer: <b>{session.organizerName}</b></div>
              <div className="info-item">Total Target: <b>{bnNumber(session.totalAmount)} BDT</b></div>
              <div className="info-item">Remaining: <b>{bnNumber(session.remainingAmount)} BDT</b></div>
              <div className="info-item">Remaining Slots: <b>{bnNumber(session.remainingSlots)}</b></div>
            </div>
          )}

          {editingBudget && session && (
            <div style={{ marginTop: "1rem", padding: "0.9rem", background: "rgba(212,168,83,0.07)", borderRadius: 12, border: "1px solid rgba(212,168,83,0.2)" }}>
              <p style={{ margin: "0 0 0.6rem", color: "#6ee7b7", fontSize: "0.78rem" }}>
                Already distributed: <b>{bnNumber(alreadyClaimed)} BDT</b> to <b>{bnNumber(session.claimedCount ?? session.peopleCount - session.remainingSlots)}</b> people — these stay fixed. Edit what&apos;s left:
              </p>

              <div style={{ marginBottom: "0.6rem" }}>
                <label style={{ display: "block", color: "#fde68a", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                  Organizer Name
                </label>
                <input type="text" value={newOrganizer} onChange={(e) => setNewOrganizer(e.target.value)} style={{ width: "100%" }} />
              </div>

              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 130px" }}>
                  <label style={{ display: "block", color: "#fde68a", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                    Total Budget (BDT)
                  </label>
                  <input type="number" min={1} value={newBudget} onChange={(e) => setNewBudget(e.target.value)} style={{ width: "100%" }} />
                </div>
                <div style={{ flex: "1 1 130px" }}>
                  <label style={{ display: "block", color: "#fde68a", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                    Remaining Slots
                  </label>
                  <input type="number" min={0} value={newSlots} onChange={(e) => setNewSlots(e.target.value)} style={{ width: "100%" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.7rem" }}>
                <button type="button" className="btn btn-primary" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }} onClick={saveBudget} disabled={budgetSaving}>
                  {budgetSaving ? "Saving..." : "Save changes"}
                </button>
                <button type="button" className="btn btn-secondary" style={{ fontSize: "0.85rem", padding: "0.5rem 0.9rem" }} onClick={() => { setEditingBudget(false); setBudgetError(""); }}>
                  Cancel
                </button>
              </div>
              {budgetError && <p style={{ color: "#fca5a5", margin: "0.5rem 0 0", fontSize: "0.82rem" }}>{budgetError}</p>}
            </div>
          )}
          {budgetSuccess && <p style={{ color: "#4ade80", marginTop: "0.5rem", fontSize: "0.88rem" }}>{budgetSuccess}</p>}
        </article>

      {/* Subtle dashboard save link */}
      <details style={{ marginTop: "1.2rem", color: "#6ee7b7" }}>
        <summary style={{ cursor: "pointer", fontSize: "0.82rem", opacity: 0.7, userSelect: "none" }}>
          🔖 Save dashboard link for another browser
        </summary>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
          <input value={dashboardUrl} readOnly style={{ flex: 1, minWidth: 0, fontSize: "0.8rem", color: "#fde68a", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(52,211,153,0.25)" }} />
          <button type="button" className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem", whiteSpace: "nowrap" }} onClick={copyDashLink}>
            {dashLinkCopied ? "Copied!" : "Copy"}
          </button>
        </div>
      </details>

      {(() => {
        const pageClaims = session?.claims ?? [];
        const claimsTotal = session?.claimsTotal ?? 0;
        const totalPages = Math.max(1, Math.ceil(claimsTotal / CLAIMS_PER_PAGE));
        return (
          <section className="panel sparkle" style={{ marginTop: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.6rem" }}>
              <h3 style={{ margin: 0 }}>Who has claimed their salami</h3>
              {claimsTotal > 0 && (
                <span style={{ color: "#6ee7b7", fontSize: "0.8rem" }}>{claimsTotal} total</span>
              )}
            </div>
            {!session || claimsTotal === 0 ? (
              <p>Nobody has spun yet.</p>
            ) : (
              <>
                <div className="info-list">
                  {pageClaims.map((claim) => (
                    <div key={claim.claimId} style={{ display: "flex", flexDirection: "column", gap: "0.25rem", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="info-item" style={{ borderBottom: "none", padding: 0 }}>
                        <b>{claim.recipientName}</b> received <b>{bnNumber(claim.amount)} BDT</b>{" "}
                        <Link href={`/card/${claim.claimId}`}>View Card</Link>
                      </div>
                      {claim.paymentRequest?.requestedAt ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.78rem", background: "rgba(212,168,83,0.15)", border: "1px solid rgba(212,168,83,0.3)", borderRadius: 8, padding: "0.2rem 0.55rem", color: "#fde68a", fontWeight: 600 }}>
                            {claim.paymentRequest.method === "bkash" ? "bKash" : claim.paymentRequest.method === "nagad" ? "Nagad" : "Rocket"}
                          </span>
                          <span style={{ fontSize: "0.82rem", color: "#6ee7b7", fontWeight: 600 }}>
                            💸 {claim.paymentRequest.number}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>সালামি দাবি করেনি</span>
                      )}
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", marginTop: "1rem" }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: "0.8rem", padding: "0.35rem 0.8rem" }}
                      onClick={() => setClaimsPage((p) => Math.max(1, p - 1))}
                      disabled={claimsPage === 1}
                    >
                      ← Prev
                    </button>
                    <span style={{ color: "#6ee7b7", fontSize: "0.82rem" }}>
                      {claimsPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: "0.8rem", padding: "0.35rem 0.8rem" }}
                      onClick={() => setClaimsPage((p) => Math.min(totalPages, p + 1))}
                      disabled={claimsPage === totalPages}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        );
      })()}
    </main>
  );
}