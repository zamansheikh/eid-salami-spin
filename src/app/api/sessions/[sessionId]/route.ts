import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Session from '@/models/Session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await dbConnect();
    const { sessionId } = await params;

    const session = await Session.findOne({ sessionId });

    if (!session) {
      return NextResponse.json({ error: 'সেশন পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({
      sessionId: session.sessionId,
      creatorName: session.creatorName,
      totalAmount: session.totalAmount,
      peopleCount: session.peopleCount,
      claimedCount: session.claimedCount,
      remaining: session.peopleCount - session.claimedCount,
      createdAt: session.createdAt,
    });
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json({ error: 'সার্ভার ত্রুটি' }, { status: 500 });
  }
}
