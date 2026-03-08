import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Session from '@/models/Session';
import Claim from '@/models/Claim';
import ShortUniqueId from 'short-unique-id';

const uid = new ShortUniqueId({ length: 10 });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await dbConnect();
    const { sessionId } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'আপনার নাম দিন' }, { status: 400 });
    }

    const session = await Session.findOne({ sessionId });

    if (!session) {
      return NextResponse.json({ error: 'সেশন পাওয়া যায়নি' }, { status: 404 });
    }

    if (session.claimedCount >= session.peopleCount) {
      return NextResponse.json({ error: 'সব সালামি বিতরণ হয়ে গেছে!' }, { status: 400 });
    }

    const slotIndex = session.claimedCount;
    const amount = session.amounts[slotIndex];
    const claimId = uid.rnd();

    const claim = await Claim.create({
      claimId,
      sessionId,
      amount,
      name: String(name).slice(0, 100),
      slotIndex,
    });

    // Increment claimed count
    await Session.updateOne({ sessionId }, { $inc: { claimedCount: 1 } });

    return NextResponse.json({
      success: true,
      claimId: claim.claimId,
      amount: claim.amount,
      name: claim.name,
      creatorName: session.creatorName,
      totalAmount: session.totalAmount,
    });
  } catch (error) {
    console.error('Claim error:', error);
    return NextResponse.json({ error: 'সার্ভার ত্রুটি' }, { status: 500 });
  }
}
