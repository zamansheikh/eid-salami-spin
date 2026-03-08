"use client";

import { toPng } from "html-to-image";
import Link from "next/link";
import QRCode from "qrcode";
import { useEffect, useMemo, useRef, useState } from "react";

type CardClientProps = {
  claimId: string;
  recipientName: string;
  organizerName: string;
  amount: number;
  createdAt: string;
};

function bnNumber(value: number) {
  return new Intl.NumberFormat("bn-BD").format(value);
}

function detectInAppBrowser() {
  if (typeof navigator === "undefined") return { inApp: false, android: false };
  const ua = navigator.userAgent || "";
  const inApp = /FBAN|FBAV|FBIOS|Instagram|MicroMessenger|Line\/|KAKAOTALK/i.test(ua);
  const android = /android/i.test(ua);
  return { inApp, android };
}

export default function CardClient({
  claimId,
  recipientName,
  organizerName,
  amount,
  createdAt,
}: CardClientProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [isFbBrowser, setIsFbBrowser] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [showOpenHint, setShowOpenHint] = useState(false);

  const cardUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/card/${claimId}`;
  }, [claimId]);

  const homeUrl = useMemo(() => {
    if (typeof window === "undefined") return "/";
    return window.location.origin;
  }, []);

  useEffect(() => {
    const { inApp, android } = detectInAppBrowser();
    setIsFbBrowser(inApp);
    setIsAndroid(android);
  }, []);

  useEffect(() => {
    if (!cardUrl) return;

    QRCode.toDataURL(cardUrl, {
      margin: 2,
      width: 120,
      color: {
        dark: "#062e28",
        light: "#fef3c7",
      },
      errorCorrectionLevel: "M",
    }).then((url) => setQrDataUrl(url));
  }, [cardUrl]);

  const openInExternalBrowser = () => {
    const url = window.location.href;
    if (isAndroid) {
      // Android intent — opens current page in Chrome
      const { hostname, pathname, search } = window.location;
      window.location.href = `intent://${hostname}${pathname}${search}#Intent;scheme=https;package=com.android.chrome;end;`;
    } else {
      // iOS / unknown — copy URL so user can paste into Safari
      navigator.clipboard.writeText(url).then(() => {
        setShowOpenHint(true);
        setTimeout(() => setShowOpenHint(false), 4000);
      }).catch(() => setShowOpenHint(true));
    }
  };

  const downloadCard = async () => {
    // Facebook / Instagram in-app browser blocks anchor.download — guide the user
    if (isFbBrowser) {
      setShowOpenHint(true);
      setTimeout(() => setShowOpenHint(false), 6000);
      return;
    }

    if (!cardRef.current) return;

    const el = cardRef.current;
    const w = el.offsetWidth;
    const h = el.offsetHeight;

    // Clone and pin to top-left so html-to-image captures it without margin offsets
    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.cssText = [
      "position:fixed",
      "top:0",
      "left:0",
      "margin:0",
      `width:${w}px`,
      "border-radius:0",
      "z-index:-9999",
      "opacity:1",
    ].join(";");
    document.body.appendChild(clone);

    try {
      const image = await toPng(clone, {
        cacheBust: true,
        pixelRatio: 2,
        width: w,
        height: h,
      });

      const anchor = document.createElement("a");
      anchor.href = image;
      anchor.download = `eid-salami-${claimId}.png`;
      anchor.click();
    } finally {
      document.body.removeChild(clone);
    }
  };

  const shareCard = async () => {
    const shareText = [
      `🌙 ঈদ মোবারক!`,
      `আলহামদুলিল্লাহ! আমি ঈদ সালামি পেয়েছি ৳${bnNumber(amount)}!`,
      ``,
      `🎁 তুমিও তোমার প্রিয়জনদের জন্য সালামি তৈরি করো:`,
      homeUrl,
      ``,
      `আমার কার্ড দেখো: ${cardUrl}`,
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({
          title: `ঈদ সালামি: ৳${bnNumber(amount)} পেয়েছি!`,
          text: shareText,
          url: cardUrl,
        });
        return;
      } catch {
        // user cancelled or not supported — fallback below
      }
    }

    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareOnFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cardUrl)}`;
    window.open(fbUrl, "_blank", "width=600,height=400");
  };

  const shareOnWhatsApp = () => {
    const text = `🌙 ঈদ মোবারক! আমি ঈদ সালামি পেয়েছি ৳${bnNumber(amount)}! 🎁\n\nতুমিও তোমার প্রিয়জনদের সালামি দাও: ${homeUrl}\n\nআমার কার্ড: ${cardUrl}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <main className="main-wrap">
      {/* ── In-app browser banner ───────────────────────── */}
      {isFbBrowser && (
        <div style={{
          background: "linear-gradient(90deg,#78350f,#92400e)",
          border: "1px solid #fbbf24",
          borderRadius: 12,
          padding: "0.85rem 1rem",
          marginBottom: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
        }}>
          <p style={{ margin: 0, color: "#fef3c7", fontWeight: 600, fontSize: "0.95rem" }}>
            ⚠️ Facebook App এর ভেতরে ডাউনলোড কাজ করে না
          </p>
          <p style={{ margin: 0, color: "#fde68a", fontSize: "0.85rem" }}>
            কার্ড ডাউনলোড করতে Chrome বা Safari এ খুলুন।
          </p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ alignSelf: "flex-start", fontSize: "0.88rem", padding: "0.5rem 1.1rem" }}
            onClick={openInExternalBrowser}
          >
            {isAndroid ? "🌐 Chrome এ খুলুন" : "🌐 লিংক কপি করুন → Safari এ পেস্ট করুন"}
          </button>
        </div>
      )}

      {/* ── "Link copied / open manually" hint ─────────── */}
      {showOpenHint && (
        <div style={{
          position: "fixed",
          bottom: "1.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 500,
          background: "#052a22",
          border: "1px solid rgba(212,168,83,0.5)",
          borderRadius: 12,
          padding: "0.8rem 1.4rem",
          color: "#fde68a",
          fontSize: "0.92rem",
          textAlign: "center",
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          maxWidth: "min(380px,90vw)",
        }}>
          {isAndroid
            ? "Chrome এ খুলে ডাউনলোড বাটন চাপুন 📥"
            : "লিংক কপি হয়েছে! Safari বা Chrome খুলে paste করুন, তারপর ডাউনলোড করুন। 📋"}
        </div>
      )}

      <div className="hero-badge">🏆 Winner Card</div>
      <h1 className="hero-title" style={{ fontSize: "clamp(1.8rem,5vw,3rem)" }}>
        আপনার ঈদ সালামি কার্ড
      </h1>

      <div className="ornament">☪</div>

      {/* ── The card for screenshot ──────────────────────── */}
      <div ref={cardRef} className="card-v2">
        {/* top arc & mosque silhouette */}
        <div className="card-v2-header">
          <div className="card-v2-mosque" aria-hidden="true">🕌</div>
          <div className="card-v2-moon" aria-hidden="true">🌙</div>
          <p className="card-v2-subtitle">Eid Mubarak</p>
          <h2 className="card-v2-heading">সালামি বিজয়ী</h2>
        </div>

        {/* amount badge */}
        <div className="card-v2-amount-wrap">
          <span className="card-v2-currency">৳</span>
          <span className="card-v2-amount">{bnNumber(amount)}</span>
        </div>

        {/* details */}
        <div className="card-v2-details">
          <div className="card-v2-row">
            <span className="card-v2-label">প্রাপক</span>
            <span className="card-v2-value">{recipientName}</span>
          </div>
          <div className="card-v2-divider" />
          <div className="card-v2-row">
            <span className="card-v2-label">দিয়েছেন</span>
            <span className="card-v2-value">{organizerName}</span>
          </div>
          <div className="card-v2-divider" />
          <div className="card-v2-row">
            <span className="card-v2-label">সময়</span>
            <span className="card-v2-value" style={{ fontSize: "0.85rem" }}>
              {new Date(createdAt).toLocaleDateString("bn-BD", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* footer with QR */}
        <div className="card-v2-footer">
          <div className="card-v2-brand">
            <div style={{ fontWeight: 700, color: "#fde68a" }}>Eid Salami Wheel</div>
            <div style={{ fontSize: "0.78rem", opacity: 0.7 }}>ভালোবাসার ঈদ উপহার</div>
            <div style={{ fontSize: "0.72rem", opacity: 0.5, marginTop: 2 }}>ID: {claimId}</div>
          </div>
          {qrDataUrl && (
            <div className="card-v2-qr">
              {/* plain img so html-to-image captures it correctly */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="QR Code"
                width={80}
                height={80}
                style={{ borderRadius: 8, display: "block" }}
              />
              <span style={{ fontSize: "0.65rem", opacity: 0.6, marginTop: 2, display: "block", textAlign: "center" }}>
                স্ক্যান করুন
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Action buttons ───────────────────────────────── */}
      <div className="card-actions">
        <button type="button" className="btn btn-secondary" onClick={downloadCard}>
          📥 কার্ড ডাউনলোড
        </button>
        <button type="button" className="btn btn-primary" onClick={shareCard}>
          {copied ? "✅ কপি হয়েছে!" : "🔗 শেয়ার করুন"}
        </button>
      </div>

      {/* ── Social share row ─────────────────────────────── */}
      <div className="card-social">
        <button type="button" className="social-btn social-fb" onClick={shareOnFacebook}>
          Facebook এ শেয়ার
        </button>
        <button type="button" className="social-btn social-wa" onClick={shareOnWhatsApp}>
          WhatsApp এ শেয়ার
        </button>
      </div>

      {/* ── Viral CTA ────────────────────────────────────── */}
      <div className="panel glow-pulse" style={{ marginTop: "2rem", textAlign: "center" }}>
        <h3 style={{ color: "var(--gold-200)", marginBottom: "0.5rem" }}>
          🎁 তুমিও সালামি দাও!
        </h3>
        <p className="text-muted" style={{ marginBottom: "1rem", lineHeight: 1.8 }}>
          তোমার প্রিয়জনদের জন্যও ঈদ সালামি তৈরি করো। স্পিন হুইলে সবাই
          আনন্দে নিজের অংশ জিতবে!
        </p>
        <Link href="/" className="btn btn-primary" style={{ fontSize: "1.05rem" }}>
          🌙 নিজের সালামি তৈরি করো
        </Link>
      </div>
    </main>
  );
}
