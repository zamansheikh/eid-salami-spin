'use client';

import { useEffect, useState, useRef, use } from 'react';
import QRCode from 'qrcode';

interface ClaimData {
  claimId: string;
  sessionId: string;
  amount: number;
  name: string;
  claimedAt: string;
  creatorName: string;
  totalAmount: number;
}

export default function CardPage({ params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = use(params);
  const [claim, setClaim] = useState<ClaimData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  const cardUrl = typeof window !== 'undefined' ? `${window.location.origin}/card/${claimId}` : '';
  const spinUrl = typeof window !== 'undefined' && claim ? `${window.location.origin}/s/${claim.sessionId}` : '';

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const res = await fetch(`/api/claims/${claimId}`);
        const data = await res.json();
        if (!data.error) {
          setClaim(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaim();
  }, [claimId]);

  useEffect(() => {
    if (cardUrl) {
      QRCode.toDataURL(cardUrl, {
        width: 150,
        margin: 2,
        color: { dark: '#064e3b', light: '#ffffff' },
      }).then(setQrDataUrl);
    }
  }, [cardUrl]);

  const downloadCard = async () => {
    if (!cardRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `eid-salami-${claim?.name || 'card'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const shareOnWhatsApp = () => {
    const text = `🌙 ঈদ মোবারক! 🎉\n\nআমি "${claim?.creatorName}" এর কাছ থেকে ৳${claim?.amount} ঈদ সালামি পেয়েছি! 🎊\n\nতুমিও স্পিন করে সালামি জিতে নাও! 🎡\n\n👉 ${spinUrl}\n\nআমার গিফট কার্ড: ${cardUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cardUrl)}`, '_blank');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      alert('লিংক কপি হয়েছে! ✅');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = cardUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('লিংক কপি হয়েছে! ✅');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-float moon-glow mb-4">🌙</div>
          <p className="text-xl text-gold-300">কার্ড লোড হচ্ছে...</p>
        </div>
      </main>
    );
  }

  if (!claim) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center glass-card p-10">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gold-300 mb-2">কার্ড পাওয়া যায়নি</h2>
          <a href="/" className="btn-gold inline-block mt-4">🏠 হোমে যান</a>
        </div>
      </main>
    );
  }

  const claimDate = new Date(claim.claimedAt);
  const formattedDate = claimDate.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10 overflow-hidden">
      {/* Decorations */}
      <div className="absolute top-8 left-8 text-5xl animate-float moon-glow opacity-40 select-none">🌙</div>
      <div className="absolute bottom-16 right-12 text-4xl animate-float opacity-30 select-none" style={{ animationDelay: '1s' }}>🕌</div>

      <div className="relative z-10 w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-6 animate-fadeInUp">
          <h1 className="text-2xl font-bold text-gold-300 mb-1">🎴 ঈদ সালামি কার্ড</h1>
          <p className="text-sm text-emerald-300">ডাউনলোড করুন বা শেয়ার করুন!</p>
        </div>

        {/* Gift Card */}
        <div className="animate-scaleIn mb-6">
          <div ref={cardRef} className="gift-card p-0" style={{ background: 'linear-gradient(145deg, #064e3b, #047857, #065f46)' }}>
            {/* Card top decorative border */}
            <div className="h-2 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

            <div className="p-6 relative">
              {/* Islamic pattern dots in background */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'radial-gradient(circle, #d4a853 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }} />

              {/* Top row: Crescent + Title */}
              <div className="text-center relative z-10 mb-5">
                <div className="text-5xl mb-2 moon-glow">🌙</div>
                <h2 className="text-2xl font-bold text-gold-300 tracking-wide">ঈদ মোবারক</h2>
                <p className="text-xs text-emerald-300 mt-1">ঈদ সালামি গিফট কার্ড</p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5 relative z-10">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
                <span className="text-gold-400 text-sm">✦</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
              </div>

              {/* Recipient & Amount */}
              <div className="text-center relative z-10 mb-5">
                <p className="text-sm text-emerald-300 mb-1">প্রাপক</p>
                <p className="text-xl font-bold text-white mb-4">{claim.name}</p>

                <div className="bg-emerald-900/60 rounded-2xl p-5 border border-gold-500/30 inline-block min-w-[200px]">
                  <p className="text-xs text-emerald-400 mb-1">সালামি পরিমাণ</p>
                  <p className="text-4xl font-bold text-gold-300">৳{claim.amount}</p>
                </div>
              </div>

              {/* From */}
              <div className="text-center relative z-10 mb-5">
                <p className="text-xs text-emerald-400">পাঠিয়েছেন</p>
                <p className="text-base font-semibold text-gold-200">{claim.creatorName} 💝</p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
                <span className="text-gold-400 text-xs">🌙</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
              </div>

              {/* Footer: QR + Info */}
              <div className="flex items-end justify-between relative z-10">
                <div className="text-left">
                  <p className="text-xs text-emerald-400">{formattedDate}</p>
                  <p className="text-xs text-emerald-500 mt-1">eid-salami.vercel.app</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">#{claim.claimId}</p>
                </div>
                {qrDataUrl && (
                  <div className="bg-white rounded-lg p-1.5">
                    <img src={qrDataUrl} alt="QR" className="w-16 h-16" />
                  </div>
                )}
              </div>
            </div>

            {/* Card bottom decorative border */}
            <div className="h-2 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <button onClick={downloadCard} className="btn-gold w-full text-lg">
            📥 কার্ড ডাউনলোড করুন
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareOnWhatsApp}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all hover:scale-105"
            >
              💬 WhatsApp
            </button>
            <button
              onClick={shareOnFacebook}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all hover:scale-105"
            >
              📘 Facebook
            </button>
          </div>

          <button
            onClick={copyLink}
            className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            📋 লিংক কপি করুন
          </button>
        </div>

        {/* CTA: Create your own */}
        <div className="mt-8 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
          <div className="glass-card p-6 text-center">
            <p className="text-gold-300 font-bold mb-2">🎁 আপনিও সালামি দিতে চান?</p>
            <p className="text-sm text-emerald-300 mb-4">নিজেও ঈদ সালামি তৈরি করে বন্ধুদের সাথে শেয়ার করুন!</p>
            <a href="/" className="btn-gold inline-block">
              🌙 সালামি তৈরি করুন
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-emerald-400/50 text-xs">
          <p>🕌 ঈদ মোবারক! ভালোবাসা ও আনন্দ ছড়িয়ে দিন 🕌</p>
        </div>
      </div>
    </main>
  );
}
