import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'বন্ধু';
  const amount = searchParams.get('amount') || '???';
  const creator = searchParams.get('creator') || '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #064e3b, #047857, #065f46)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Border top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: 'linear-gradient(90deg, #b8922e, #d4a853, #f0d48a, #d4a853, #b8922e)',
          }}
        />

        {/* Border bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: 'linear-gradient(90deg, #b8922e, #d4a853, #f0d48a, #d4a853, #b8922e)',
          }}
        />

        {/* Moon */}
        <div style={{ fontSize: '80px', marginBottom: '10px' }}>🌙</div>

        {/* Title */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#d4a853',
            marginBottom: '10px',
          }}
        >
          ঈদ মোবারক!
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: '28px',
            color: '#d1fae5',
            marginBottom: '20px',
          }}
        >
          {name} ঈদ সালামি পেয়েছেন!
        </div>

        {/* Amount box */}
        <div
          style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '24px',
            padding: '20px 60px',
            border: '2px solid rgba(212, 168, 83, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '20px', color: '#6ee7b7' }}>সালামি পরিমাণ</div>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#d4a853',
            }}
          >
            ৳{amount}
          </div>
        </div>

        {creator && (
          <div style={{ fontSize: '22px', color: '#a7f3d0', marginTop: '20px' }}>
            {creator} এর পক্ষ থেকে 💝
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            fontSize: '16px',
            color: 'rgba(167, 243, 208, 0.5)',
          }}
        >
          eid-salami.vercel.app | স্পিন করুন, সালামি জিতুন! 🎡
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
