import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Claim from '@/models/Claim';
import Session from '@/models/Session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ claimId: string }> }
) {
  try {
    await dbConnect();
    const { claimId } = await params;

    const claim = await Claim.findOne({ claimId });

    if (!claim) {
      return NextResponse.json({ error: 'তথ্য পাওয়া যায়নি' }, { status: 404 });
    }

    const session = await Session.findOne({ sessionId: claim.sessionId });

    return NextResponse.json({
      claimId: claim.claimId,
      sessionId: claim.sessionId,
      amount: claim.amount,
      name: claim.name,
      claimedAt: claim.claimedAt,
      creatorName: session?.creatorName || '',
      totalAmount: session?.totalAmount || 0,
    });
  } catch (error) {
    console.error('Claim fetch error:', error);
    return NextResponse.json({ error: 'সার্ভার ত্রুটি' }, { status: 500 });
  }
}
