import { NextResponse } from "next/server";
import ShortUniqueId from "short-unique-id";
import { connectToDatabase } from "@/lib/mongodb";
import { getBaseUrl } from "@/lib/utils";
import { ClaimModel } from "@/models/Claim";
import { SessionModel } from "@/models/Session";

export const runtime = "nodejs";

const uid = new ShortUniqueId({ length: 10 });
const tokenUid = new ShortUniqueId({ length: 24 });

type Context = {
  params: Promise<{ sessionId: string }>;
};

export async function POST(request: Request, context: Context) {
  try {
    await connectToDatabase();
    const { sessionId } = await context.params;
    const body = await request.json();

    const recipientName = String(body.recipientName || "").trim();

    if (!recipientName) {
      return NextResponse.json(
        { message: "আপনার নাম লিখুন।" },
        { status: 400 }
      );
    }

    const session = await SessionModel.findOne({ sessionId });

    if (!session) {
      return NextResponse.json(
        { message: "এই সালামি সেশন পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    if (session.remainingSlots <= 0 || session.pendingAmounts.length === 0) {
      return NextResponse.json(
        { message: "দুঃখিত, সব সালামি ইতিমধ্যে বিতরণ হয়ে গেছে।" },
        { status: 409 }
      );
    }

    const randomIndex = Math.floor(Math.random() * session.pendingAmounts.length);
    const [amount] = session.pendingAmounts.splice(randomIndex, 1);
    const claimId = uid.rnd();
    const claimToken = tokenUid.rnd();
    const now = new Date();

    session.remainingAmount -= amount;
    session.remainingSlots -= 1;
    session.claims.push({
      claimId,
      recipientName,
      amount,
      claimedAt: now,
    });

    await session.save();

    await ClaimModel.create({
      claimId,
      claimToken,
      sessionId,
      organizerName: session.organizerName,
      recipientName,
      amount,
    });

    const baseUrl = getBaseUrl();

    return NextResponse.json({
      claimId,
      claimToken,
      recipientName,
      amount,
      cardUrl: `${baseUrl}/card/${claimId}`,
      remainingSlots: session.remainingSlots,
      remainingAmount: session.remainingAmount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "সালামি দাবি করা যায়নি। আবার চেষ্টা করুন।",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
