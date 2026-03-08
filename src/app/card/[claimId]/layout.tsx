import type { Metadata } from 'next';
import dbConnect from '@/lib/mongodb';
import Claim from '@/models/Claim';
import Session from '@/models/Session';

type Props = {
  params: Promise<{ claimId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { claimId } = await params;

  try {
    await dbConnect();
    const claim = await Claim.findOne({ claimId }).lean();

    if (!claim) {
      return {
        title: 'ঈদ সালামি কার্ড 🌙',
        description: 'ঈদের আনন্দে সালামি জিতুন!',
      };
    }

    const session = await Session.findOne({ sessionId: claim.sessionId }).lean();
    const creatorName = session?.creatorName || '';

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const ogUrl = `${baseUrl}/api/og?name=${encodeURIComponent(String(claim.name))}&amount=${claim.amount}&creator=${encodeURIComponent(creatorName)}`;

    return {
      title: `${claim.name} ৳${claim.amount} সালামি পেয়েছেন! 🌙`,
      description: `${creatorName} এর কাছ থেকে ৳${claim.amount} ঈদ সালামি! তুমিও স্পিন করে জিতে নাও! 🎡`,
      openGraph: {
        title: `🌙 ${claim.name} ৳${claim.amount} ঈদ সালামি জিতেছেন!`,
        description: `${creatorName} এর পক্ষ থেকে ঈদ সালামি! তুমিও স্পিন করে জিতে নাও! 🎡`,
        images: [{ url: ogUrl, width: 1200, height: 630 }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `🌙 ${claim.name} ৳${claim.amount} ঈদ সালামি জিতেছেন!`,
        description: `তুমিও স্পিন করে সালামি জিতে নাও! 🎡`,
        images: [ogUrl],
      },
    };
  } catch {
    return {
      title: 'ঈদ সালামি কার্ড 🌙',
      description: 'ঈদের আনন্দে সালামি জিতুন!',
    };
  }
}

export default function CardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
