"use client";

import { useState } from "react";

type PayMethod = "bkash" | "nagad" | "rocket";

type ClaimSalamiModalProps = {
  claimId: string;
  claimToken: string | null;
  onClose: () => void;
  onSuccess?: () => void;
};

const METHOD_LABEL: Record<PayMethod, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
};

/**
 * In-place "claim your salami" form. Lets the winner tell the organizer which
 * mobile-wallet number to send the money to. Used by both the spin page and
 * the card page so the flow is identical everywhere.
 */
export default function ClaimSalamiModal({
  claimId,
  claimToken,
  onClose,
  onSuccess,
}: ClaimSalamiModalProps) {
  const [method, setMethod] = useState<PayMethod>("bkash");
  const [number, setNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    const trimmed = number.trim();
    if (!trimmed) {
      setError("মোবাইল নম্বর দিন।");
      return;
    }
    if (!claimToken) {
      setError("আপনি এই কার্ডের বিজয়ী নন।");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, number: trimmed, claimToken }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok && res.status !== 409) throw new Error(data.message ?? "Error");
      localStorage.setItem(`eid_pay_req_${claimId}`, "1");
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "কিছু একটা সমস্যা হয়েছে।");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background: "rgba(3, 7, 18, 0.8)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "min(420px, 100%)",
          borderRadius: 22,
          background: "linear-gradient(160deg, #1d1142, #122a3c)",
          border: "1px solid rgba(245,197,66,0.35)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.65), 0 0 50px rgba(124,58,237,0.18)",
          padding: "1.6rem",
          animation: "fadeUp 0.35s ease-out",
        }}
      >
        <h3 style={{ color: "#ffd24a", margin: "0 0 0.3rem", fontSize: "1.25rem" }}>
          💸 সালামি দাবি করুন
        </h3>
        <p style={{ color: "#c4b5fd", fontSize: "0.85rem", margin: "0 0 1.2rem" }}>
          কোন মাধ্যমে টাকা পাঠাতে হবে তা জানান। অর্গানাইজার এখানে পাঠাবেন।
        </p>

        <p style={{ color: "#f5c542", fontWeight: 600, fontSize: "0.88rem", margin: "0 0 0.5rem" }}>
          পেমেন্ট মাধ্যম
        </p>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          {(["bkash", "nagad", "rocket"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              style={{
                flex: 1,
                padding: "0.6rem",
                borderRadius: 12,
                border: method === m ? "2px solid #f5c542" : "1px solid rgba(196,181,253,0.3)",
                background: method === m ? "rgba(245,197,66,0.16)" : "rgba(255,255,255,0.04)",
                color: method === m ? "#ffe79b" : "#a5a5b8",
                fontWeight: method === m ? 700 : 500,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.18s ease",
              }}
            >
              {METHOD_LABEL[m]}
            </button>
          ))}
        </div>

        <p style={{ color: "#f5c542", fontWeight: 600, fontSize: "0.88rem", margin: "0 0 0.4rem" }}>
          মোবাইল নম্বর
        </p>
        <input
          type="tel"
          inputMode="numeric"
          placeholder="01XXXXXXXXX"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          autoFocus
          style={{ width: "100%", marginBottom: "1rem", fontSize: "1rem", padding: "0.7rem 0.85rem", borderRadius: 12 }}
        />

        {error && (
          <p style={{ color: "#fca5a5", fontSize: "0.85rem", margin: "-0.5rem 0 0.8rem" }}>{error}</p>
        )}

        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1, fontSize: "0.95rem" }}
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? "পাঠানো হচ্ছে..." : "✅ পাঠান"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: "0.95rem" }}
            onClick={onClose}
          >
            বাতিল
          </button>
        </div>
      </div>
    </div>
  );
}
