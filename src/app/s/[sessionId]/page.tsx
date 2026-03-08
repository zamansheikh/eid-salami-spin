'use client';

import { useEffect, useState, useCallback, useRef, use } from 'react';
import confetti from 'canvas-confetti';

interface SessionData {
  sessionId: string;
  creatorName: string;
  totalAmount: number;
  peopleCount: number;
  claimedCount: number;
  remaining: number;
}

interface ClaimResult {
  claimId: string;
  amount: number;
  name: string;
  creatorName: string;
}

const WHEEL_COLORS = [
  '#064e3b', '#047857', '#065f46', '#0d9488',
  '#059669', '#0f766e', '#115e59', '#0e4a3c',
];

const WHEEL_LABELS = [
  '🎁', '💰', '🌙', '⭐', '✨', '🎉', '💝', '🕌',
  '🎊', '💫', '🌟', '🎀',
];

export default function SpinPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phase, setPhase] = useState<'info' | 'name' | 'spinning' | 'result' | 'finished'>('info');
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null);
  const [error, setError] = useState('');
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        const data = await res.json();
        if (!data.error) {
          setSession(data);
          if (data.remaining <= 0) {
            setPhase('finished');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#d4a853', '#f0d48a', '#10b981', '#ffffff', '#fbbf24'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const handleSpin = async () => {
    if (!name.trim()) {
      setError('আপনার নাম লিখুন');
      return;
    }
    setError('');
    setIsSpinning(true);
    setPhase('spinning');

    // Start spinning animation
    const spinDegrees = 360 * 8 + Math.random() * 360; // 8+ full rotations
    setRotation(prev => prev + spinDegrees);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();

      // Wait for spin animation
      setTimeout(() => {
        setIsSpinning(false);
        if (data.success) {
          setClaimResult(data);
          setPhase('result');
          fireConfetti();
        } else {
          setError(data.error || 'কিছু সমস্যা হয়েছে');
          setPhase('name');
        }
      }, 4500);
    } catch {
      setTimeout(() => {
        setIsSpinning(false);
        setError('সংযোগ ত্রুটি');
        setPhase('name');
      }, 4500);
    }
  };

  const segments = session ? Math.max(session.peopleCount, 6) : 8;

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
          <p className="text-emerald-200 mb-4">এই লিংকটি সঠিক নয় বা মেয়াদ শেষ হয়েছে</p>
          <a href="/" className="btn-gold inline-block">🏠 হোমে যান</a>
        </div>
      </main>
    );
  }

  if (phase === 'finished') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center glass-card p-10 max-w-md w-full animate-fadeInUp">
          <div className="text-6xl mb-4">🎊</div>
          <h2 className="text-2xl font-bold text-gold-300 mb-2">সব সালামি বিতরণ হয়ে গেছে!</h2>
          <p className="text-emerald-200 mb-2">
            {session.creatorName} এর ৳{session.totalAmount} সালামি
          </p>
          <p className="text-emerald-300">সবগুলো সালামি ইতিমধ্যে দাবি করা হয়েছে</p>
          <a href="/" className="btn-gold inline-block mt-6">🎁 নিজে সালামি তৈরি করুন</a>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10 overflow-hidden">
      {/* Decorations */}
      <div className="absolute top-8 left-8 text-5xl animate-float moon-glow opacity-50 select-none">🌙</div>
      <div className="absolute top-12 right-10 text-3xl animate-float opacity-30 select-none" style={{ animationDelay: '1s' }}>⭐</div>
      <div className="absolute bottom-16 right-16 text-4xl animate-float opacity-40 select-none" style={{ animationDelay: '0.5s' }}>🕌</div>

      {/* Header */}
      <div className="relative z-10 text-center mb-8 animate-fadeInUp">
        <div className="text-5xl mb-2 moon-glow">🌙</div>
        <h1 className="text-3xl sm:text-4xl font-bold animate-shimmer mb-1">ঈদ সালামি</h1>
        <p className="text-emerald-200">
          <span className="text-gold-300 font-semibold">{session.creatorName}</span> আপনার জন্য সালামি রেখেছেন!
        </p>
        <p className="text-sm text-emerald-300 mt-1">
          মোট ৳{session.totalAmount} | বাকি {session.remaining} জন
        </p>
      </div>

      {/* Phase: Info - show invitation */}
      {phase === 'info' && (
        <div className="relative z-10 w-full max-w-md animate-fadeInUp">
          <div className="glass-card p-8 text-center">
            <div className="text-5xl mb-4">🎁</div>
            <h2 className="text-2xl font-bold text-gold-300 mb-3">সালামি অপেক্ষা করছে!</h2>
            <p className="text-emerald-200 mb-6 leading-relaxed">
              <span className="font-bold text-gold-200">{session.creatorName}</span> আপনার জন্য ঈদ সালামি রেখেছেন। 
              হুইল স্পিন করে আপনার ভাগ্য যাচাই করুন! 🎡
            </p>
            <div className="bg-emerald-900/40 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-xs text-emerald-400">মোট সালামি</p>
                  <p className="text-xl font-bold text-gold-300">৳{session.totalAmount}</p>
                </div>
                <div>
                  <p className="text-xs text-emerald-400">বাকি স্লট</p>
                  <p className="text-xl font-bold text-gold-300">{session.remaining} জন</p>
                </div>
              </div>
            </div>
            <button onClick={() => setPhase('name')} className="btn-gold w-full text-lg">
              🎡 স্পিন করতে চাই!
            </button>
          </div>
        </div>
      )}

      {/* Phase: Name input */}
      {phase === 'name' && (
        <div className="relative z-10 w-full max-w-md animate-fadeInUp">
          <div className="glass-card p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">✨</div>
              <h2 className="text-xl font-bold text-gold-300">আপনার নাম দিন</h2>
              <p className="text-sm text-emerald-300">নাম দিয়ে হুইল স্পিন করুন</p>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                className="input-eid"
                placeholder="আপনার নাম লিখুন..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                onKeyDown={(e) => e.key === 'Enter' && handleSpin()}
              />
              {error && (
                <div className="bg-red-500/20 border border-red-400/40 rounded-xl p-3 text-center text-red-200 text-sm">
                  ⚠️ {error}
                </div>
              )}
              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className="btn-gold w-full text-lg"
              >
                🎡 স্পিন করুন!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase: Spinning wheel */}
      {phase === 'spinning' && (
        <div className="relative z-10 animate-fadeInUp">
          <div className="text-center mb-6">
            <p className="text-xl text-gold-300 font-bold">🎡 হুইল ঘুরছে...</p>
            <p className="text-sm text-emerald-300">ভাগ্য যাচাই হচ্ছে!</p>
          </div>
          <div className="wheel-container">
            <div className="wheel-pointer">▼</div>
            <div
              ref={wheelRef}
              className="wheel"
              style={{
                transform: `rotate(${rotation}deg)`,
                background: generateWheelBackground(segments),
              }}
            >
              {/* Wheel segment labels */}
              {Array.from({ length: segments }).map((_, i) => {
                const angle = (360 / segments) * i + (360 / segments / 2);
                return (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 text-2xl"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-120px) rotate(0deg)`,
                      transformOrigin: '0 0',
                      marginLeft: '-12px',
                      marginTop: '-12px',
                    }}
                  >
                    {WHEEL_LABELS[i % WHEEL_LABELS.length]}
                  </div>
                );
              })}
              {/* Center */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg border-2 border-gold-300 z-10">
                <span className="text-emerald-900 font-bold text-lg">৳</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase: Result */}
      {phase === 'result' && claimResult && (
        <div className="relative z-10 w-full max-w-md animate-scaleIn">
          <div className="glass-card p-8 text-center animate-pulse-gold">
            <div className="text-6xl mb-4">🎊</div>
            <h2 className="text-2xl font-bold text-gold-300 mb-2">মোবারক হো! 🎉</h2>
            <p className="text-emerald-200 mb-4">
              প্রিয় <span className="text-gold-200 font-bold">{claimResult.name}</span>, আপনি জিতেছেন!
            </p>
            <div className="bg-emerald-900/60 rounded-2xl p-6 mb-6 border border-gold-500/30">
              <p className="text-sm text-emerald-300 mb-1">আপনার ঈদ সালামি</p>
              <p className="text-5xl sm:text-6xl font-bold text-gold-300 animate-shimmer">
                ৳{claimResult.amount}
              </p>
              <p className="text-xs text-emerald-400 mt-2">
                {claimResult.creatorName} এর পক্ষ থেকে
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={`/card/${claimResult.claimId}`}
                className="btn-gold w-full block text-center text-lg"
              >
                🎴 গিফট কার্ড দেখুন
              </a>
              <button
                onClick={() => {
                  const text = `🌙 ঈদ মোবারক! 🎉\n\nআমি ঈদ সালামিতে ৳${claimResult.amount} জিতেছি! 🎊\n\nতুমিও স্পিন করে জিতে নাও! 🎡\n\n👉 ${window.location.origin}/s/${sessionId}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition-all hover:scale-105 text-lg"
              >
                💬 WhatsApp এ শেয়ার করুন
              </button>
              <a
                href="/"
                className="block text-gold-300 hover:text-gold-200 underline text-sm mt-4"
              >
                🎁 নিজেও সালামি তৈরি করুন!
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function generateWheelBackground(segments: number): string {
  const colors = WHEEL_COLORS;
  const sliceAngle = 360 / segments;
  let gradient = 'conic-gradient(';
  for (let i = 0; i < segments; i++) {
    const color = colors[i % colors.length];
    const start = sliceAngle * i;
    const end = sliceAngle * (i + 1);
    gradient += `${color} ${start}deg ${end}deg`;
    if (i < segments - 1) gradient += ', ';
  }
  gradient += ')';
  return gradient;
}
