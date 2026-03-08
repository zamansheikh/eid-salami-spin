'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [creatorName, setCreatorName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [peopleCount, setPeopleCount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseInt(totalAmount);
    const count = parseInt(peopleCount);

    if (!creatorName.trim()) {
      setError('আপনার নাম লিখুন');
      return;
    }
    if (!amount || amount < 10) {
      setError('সর্বনিম্ন ১০ টাকা দিতে হবে');
      return;
    }
    if (!count || count < 1 || count > 50) {
      setError('১ থেকে ৫০ জন পর্যন্ত নির্বাচন করুন');
      return;
    }
    if (amount < count) {
      setError('পরিমাণ অবশ্যই মানুষের সংখ্যার চেয়ে বেশি হতে হবে');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorName: creatorName.trim(),
          totalAmount: amount,
          peopleCount: count,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/created/${data.sessionId}`);
      } else {
        setError(data.error || 'কিছু সমস্যা হয়েছে');
      }
    } catch {
      setError('সংযোগ ত্রুটি, আবার চেষ্টা করুন');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10 overflow-hidden">
      {/* Floating decorations */}
      <div className="absolute top-10 left-10 text-6xl animate-float moon-glow opacity-60 select-none" style={{ animationDelay: '0s' }}>🌙</div>
      <div className="absolute top-20 right-16 text-4xl animate-float opacity-40 select-none" style={{ animationDelay: '1s' }}>⭐</div>
      <div className="absolute bottom-20 left-20 text-3xl animate-float opacity-30 select-none" style={{ animationDelay: '2s' }}>✨</div>
      <div className="absolute bottom-32 right-10 text-5xl animate-float moon-glow opacity-50 select-none" style={{ animationDelay: '0.5s' }}>🕌</div>
      <div className="absolute top-1/3 right-8 text-2xl animate-float opacity-20 select-none" style={{ animationDelay: '1.5s' }}>🌟</div>

      {/* Hero Section */}
      <div className="relative z-10 text-center mb-10 animate-fadeInUp">
        <div className="text-7xl sm:text-8xl mb-4 animate-float moon-glow">🌙</div>
        <h1 className="text-4xl sm:text-6xl font-bold mb-3">
          <span className="animate-shimmer">ঈদ সালামি</span>
        </h1>
        <p className="text-lg sm:text-xl text-emerald-100 max-w-lg mx-auto leading-relaxed">
          ঈদের আনন্দে প্রিয়জনদের সালামি দিন! 🎉
          <br />
          <span className="text-gold-300">স্পিন করুন • সালামি জিতুন • আনন্দ ভাগ করুন</span>
        </p>
      </div>

      {/* Form Card */}
      <div className="relative z-10 w-full max-w-md animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
        <div className="glass-card p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gold-300">সালামি সেটআপ করুন</h2>
            <p className="text-sm text-emerald-200 mt-1">আপনার সালামি টার্গেট ও মানুষের সংখ্যা দিন</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gold-200 mb-2">
                ✨ আপনার নাম
              </label>
              <input
                type="text"
                className="input-eid"
                placeholder="যেমনঃ রহিম ভাই"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gold-200 mb-2">
                💰 মোট সালামি পরিমাণ (টাকা)
              </label>
              <input
                type="number"
                className="input-eid"
                placeholder="যেমনঃ ১০০০"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                min={10}
                max={1000000}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gold-200 mb-2">
                👥 কতজনের মধ্যে বিতরণ
              </label>
              <input
                type="number"
                className="input-eid"
                placeholder="যেমনঃ ৫"
                value={peopleCount}
                onChange={(e) => setPeopleCount(e.target.value)}
                min={1}
                max={50}
              />
            </div>

            {totalAmount && peopleCount && parseInt(totalAmount) >= parseInt(peopleCount) && (
              <div className="bg-emerald-900/40 border border-gold-500/30 rounded-xl p-4 text-center">
                <p className="text-sm text-emerald-200">প্রতি জনে গড়ে পাবে</p>
                <p className="text-2xl font-bold text-gold-300">
                  ৳ {Math.floor(parseInt(totalAmount) / parseInt(peopleCount))}
                </p>
                <p className="text-xs text-emerald-300 mt-1">
                  (প্রকৃত পরিমাণ র‍্যান্ডম হবে! 🎲)
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-400/40 rounded-xl p-3 text-center text-red-200 text-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-gold w-full text-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  তৈরি হচ্ছে...
                </span>
              ) : (
                '🎁 সালামি তৈরি করুন'
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center mt-8 text-emerald-300/60 text-xs space-y-1">
          <p>🕌 ঈদ মোবারক! সবার জন্য শুভকামনা 🕌</p>
          <p>ভালোবাসা ও আনন্দ ছড়িয়ে দিন</p>
        </div>
      </div>

      {/* How it works */}
      <div className="relative z-10 w-full max-w-2xl mt-16 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
        <h3 className="text-center text-2xl font-bold text-gold-300 mb-8">কিভাবে কাজ করে? 🤔</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-6 text-center">
            <div className="text-4xl mb-3">💰</div>
            <h4 className="font-bold text-gold-300 mb-2">১। সালামি সেট করুন</h4>
            <p className="text-sm text-emerald-200">মোট পরিমাণ ও মানুষের সংখ্যা দিন</p>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-4xl mb-3">🔗</div>
            <h4 className="font-bold text-gold-300 mb-2">২। লিংক শেয়ার করুন</h4>
            <p className="text-sm text-emerald-200">বন্ধু ও পরিবারে লিংক পাঠান</p>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-4xl mb-3">🎡</div>
            <h4 className="font-bold text-gold-300 mb-2">৩। স্পিন করে জিতুন</h4>
            <p className="text-sm text-emerald-200">হুইল ঘুরান এবং সালামি জিতুন!</p>
          </div>
        </div>
      </div>
    </main>
  );
}
