"use client";

import { toPng } from "html-to-image";
import Image from "next/image";
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

export default function CardClient({
  claimId,
  recipientName,
  organizerName,
  amount,
  createdAt,
}: CardClientProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const cardUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/card/${claimId}`;
  }, [claimId]);

  useEffect(() => {
    if (!cardUrl) return;

    QRCode.toDataURL(cardUrl, {
      margin: 1,
      width: 108,
      color: {
        dark: "#d4a853",
        light: "#064e3b",
      },
    }).then((url) => setQrDataUrl(url));
  }, [cardUrl]);

  const downloadCard = async () => {
    if (!cardRef.current) return;

    const image = await toPng(cardRef.current, {
      cacheBust: true,
      backgroundColor: "#064e3b",
      pixelRatio: 2,
    });

    const anchor = document.createElement("a");
    anchor.href = image;
    anchor.download = `eid-salami-${claimId}.png`;
    anchor.click();
  };

  const shareCard = async () => {
    const text = `আলহামদুলিল্লাহ! আমি ঈদ সালামি পেয়েছি ৳${bnNumber(amount)}।\n${cardUrl}`;

    if (navigator.share) {
      await navigator.share({
        title: "আমার ঈদ সালামি কার্ড",
        text,
        url: cardUrl,
      });
      return;
    }

    await navigator.clipboard.writeText(text);
    alert("শেয়ার টেক্সট কপি হয়েছে");
  };

  return (
    <main className="main-wrap">
      <div className="hero-badge">🏆 Winner Card</div>
      <h1 className="hero-title" style={{ fontSize: "clamp(1.8rem,5vw,3rem)" }}>
        আপনার ঈদ সালামি কার্ড
      </h1>

      <div className="ornament">☪</div>

      <div ref={cardRef} className="card-shot sparkle">
        <div className="card-top-border" />
        <p className="card-title">🌙 Eid Mubarak • সালামি বিজয়ী</p>
        <div className="card-main">
          <p style={{ margin: 0 }}>প্রাপক</p>
          <h2 style={{ marginTop: "0.25rem", marginBottom: 0 }}>{recipientName}</h2>
          <p className="card-amount">৳ {bnNumber(amount)}</p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>দিয়েছেন: {organizerName}</p>
          <p style={{ marginTop: "0.5rem", marginBottom: 0, fontSize: "0.86rem" }}>
            সময়: {new Date(createdAt).toLocaleString("bn-BD")}
          </p>
        </div>

        <div className="card-footer">
          <div className="card-credit">
            <div>ভালবাসার ঈদ উপহার</div>
            <div>Powered by Eid Salami Wheel</div>
            <div>Card ID: {claimId}</div>
          </div>
          {qrDataUrl ? <Image src={qrDataUrl} alt="কার্ড কিউআর" width={88} height={88} unoptimized style={{ borderRadius: 8 }} /> : null}
        </div>
        <div className="card-bottom-border" />
      </div>

      <div className="row" style={{ justifyContent: "center", marginTop: "1rem" }}>
        <button type="button" className="btn btn-secondary" onClick={downloadCard}>
          কার্ড ডাউনলোড
        </button>
        <button type="button" className="btn btn-primary" onClick={shareCard}>
          শেয়ার করুন
        </button>
      </div>
    </main>
  );
}
