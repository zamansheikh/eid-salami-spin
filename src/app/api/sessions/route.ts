import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Session from '@/models/Session';
import { distributeRandomly } from '@/lib/distribute';
import ShortUniqueId from 'short-unique-id';

const uid = new ShortUniqueId({ length: 8 });

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { creatorName, totalAmount, peopleCount } = body;

    if (!creatorName || !totalAmount || !peopleCount) {
      return NextResponse.json({ error: 'সব তথ্য প্রদান করুন' }, { status: 400 });
    }

    if (totalAmount < 1 || peopleCount < 1 || peopleCount > 50) {
      return NextResponse.json({ error: 'অবৈধ পরিমাণ বা সংখ্যা' }, { status: 400 });
    }

    const sessionId = uid.rnd();
    const amounts = distributeRandomly(Math.floor(totalAmount), Math.floor(peopleCount));

    const session = await Session.create({
      sessionId,
      creatorName: String(creatorName).slice(0, 100),
      totalAmount: Math.floor(totalAmount),
      peopleCount: Math.floor(peopleCount),
      amounts,
      claimedCount: 0,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      totalAmount: session.totalAmount,
      peopleCount: session.peopleCount,
    });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'সার্ভার ত্রুটি' }, { status: 500 });
  }
}
