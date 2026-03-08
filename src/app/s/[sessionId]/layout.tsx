import type { Metadata } from 'next';
import dbConnect from '@/lib/mongodb';
import Session from '@/models/Session';

type Props = {
  params: Promise<{ sessionId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sessionId } = await params;

  try {
    await dbConnect();
    const session = await Session.findOne({ sessionId }).lean();

    if (!session) {
      return {
        title: 'ঈদ সালামি 🌙',
        description: 'স্পিন করুন এবং সালামি জিতুন!',
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const ogUrl = `${baseUrl}/api/og?name=${encodeURIComponent(String(session.creatorName))}&amount=${session.totalAmount}&creator=`;

    return {
      title: `${session.creatorName} এর ঈদ সালামি! 🌙`,
      description: `৳${session.totalAmount} সালামি ${session.peopleCount} জনের মধ্যে! স্পিন করে জিতে নাও! 🎡`,
      openGraph: {
        title: `🌙 ${session.creatorName} ঈদ সালামি দিচ্ছেন!`,
        description: `৳${session.totalAmount} সালামি ${session.peopleCount} জনের মধ্যে! স্পিন করে জিতে নাও! 🎡`,
        images: [{ url: ogUrl, width: 1200, height: 630 }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `🌙 ${session.creatorName} ঈদ সালামি দিচ্ছেন!`,
        description: `স্পিন করে সালামি জিতে নাও! 🎡`,
        images: [ogUrl],
      },
    };
  } catch {
    return {
      title: 'ঈদ সালামি 🌙',
      description: 'স্পিন করুন এবং সালামি জিতুন!',
    };
  }
}

export default function SpinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
