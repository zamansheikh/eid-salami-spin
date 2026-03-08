'use client';

import { useEffect, useState, use } from 'react';
import QRCode from 'qrcode';

interface SessionData {
  sessionId: string;
  creatorName: string;
  totalAmount: number;
  peopleCount: number;
  claimedCount: number;
  remaining: number;
}

export default function CreatedPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [session, setSession] = useState<SessionData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/s/${sessionId}`
    : '';

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        const data = await res.json();
        if (!data.error) {
          setSession(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    if (shareUrl) {
      QRCode.toDataURL(shareUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#064e3b', light: '#ffffff' },
      }).then(setQrDataUrl);
    }
  }, [shareUrl]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnWhatsApp = () => {
    const text = `🌙 ঈদ মোবারক! 🎉\n\n${session?.creatorName} আপনার জন্য ঈদ সালামি রেখেছেন! 🎁\n\nস্পিন করে আপনার সালামি জিতে নিন! 🎡\n\n👉 ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-float moon-glow mb-4">🌙</div>
          <p className="text-xl text-gold-300">লোড হচ্ছে...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center glass-card p-10">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gold-300 mb-2">সেশন পাওয়া যায়নি</h2>
          <a href="/" className="btn-gold inline-block mt-4">🏠 হোমে যান</a>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10 overflow-hidden">
      {/* Decorations */}
      <div className="absolute top-10 left-10 text-5xl animate-float moon-glow opacity-50 select-none">🌙</div>
      <div className="absolute top-16 right-12 text-3xl animate-float opacity-30 select-none" style={{ animationDelay: '1s' }}>⭐</div>
      <div className="absolute bottom-20 right-20 text-4xl animate-float moon-glow opacity-40 select-none" style={{ animationDelay: '0.5s' }}>🕌</div>

      <div className="relative z-10 w-full max-w-lg animate-fadeInUp">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3 animate-scaleIn">🎉</div>
          <h1 className="text-3xl font-bold text-gold-300 mb-2">সালামি তৈরি হয়েছে!</h1>
          <p className="text-emerald-200">এখন নিচের লিংক শেয়ার করুন</p>
        </div>

        {/* Session Info Card */}
        <div className="glass-card p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-emerald-300">মোট সালামি</p>
              <p className="text-3xl font-bold text-gold-300">৳{session.totalAmount}</p>
            </div>
            <div>
              <p className="text-sm text-emerald-300">জন সংখ্যা</p>
              <p className="text-3xl font-bold text-gold-300">{session.peopleCount} জন</p>
            </div>
          </div>
          <div className="text-center mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-emerald-300">তৈরি করেছেন</p>
            <p className="text-lg font-semibold text-gold-200">{session.creatorName}</p>
          </div>
        </div>

        {/* Share Link */}
        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-bold text-gold-300 mb-3 text-center">🔗 শেয়ার লিংক</h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-emerald-900/50 rounded-xl px-4 py-3 text-sm text-emerald-100 overflow-hidden">
              <p className="truncate">{shareUrl}</p>
            </div>
            <button
              onClick={copyLink}
              className="btn-gold !px-4 !py-3 text-sm whitespace-nowrap"
            >
              {copied ? '✅ কপি হয়েছে' : '📋 কপি'}
            </button>
          </div>
        </div>

        {/* QR Code */}
        {qrDataUrl && (
          <div className="glass-card p-6 mb-6 text-center">
            <h3 className="text-lg font-bold text-gold-300 mb-3">📱 QR কোড</h3>
            <div className="inline-block bg-white rounded-xl p-3">
              <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
            </div>
            <p className="text-xs text-emerald-300 mt-2">QR স্ক্যান করে সরাসরি সালামি পেজে যান</p>
          </div>
        )}

        {/* Share Buttons */}
        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-bold text-gold-300 mb-4 text-center">📣 শেয়ার করুন</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareOnWhatsApp}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all hover:scale-105"
            >
              <span className="text-xl">💬</span>
              WhatsApp
            </button>
            <button
              onClick={shareOnFacebook}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all hover:scale-105"
            >
              <span className="text-xl">📘</span>
              Facebook
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="glass-card p-4 text-center">
          <p className="text-sm text-emerald-300">
            ⏳ {session.remaining} জন এখনো সালামি নেয়নি | {session.claimedCount} জন নিয়েছে
          </p>
        </div>

        {/* Back */}
        <div className="text-center mt-6">
          <a href="/" className="text-gold-300 hover:text-gold-200 underline text-sm">
            ← নতুন সালামি তৈরি করুন
          </a>
        </div>
      </div>
    </main>
  );
}
