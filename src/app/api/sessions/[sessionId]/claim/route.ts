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

    const session = await SessionModel.findOne({ sessionId })
      .select("organizerName remainingSlots")
      .lean();

    if (!session) {
      return NextResponse.json(
        { message: "এই সালামি সেশন পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    if (session.remainingSlots <= 0) {
      return NextResponse.json(
        { message: "দুঃখিত, সব সালামি ইতিমধ্যে বিতরণ হয়ে গেছে।" },
        { status: 409 }
      );
    }

    // Atomically claim one slot — pop a pending amount and decrement the slot
    // count in a SINGLE document update. MongoDB serializes per-document
    // updates, so concurrent spins can never grab the same amount or oversell
    // slots. pendingAmounts is shuffled at creation, so popping the last
    // element is effectively a random draw. Only small fields are projected
    // (never the claims array).
    const before = await SessionModel.findOneAndUpdate(
      { sessionId, remainingSlots: { $gt: 0 }, "pendingAmounts.0": { $exists: true } },
      { $pop: { pendingAmounts: 1 }, $inc: { remainingSlots: -1 } },
      { new: false, projection: { pendingAmounts: 1, remainingAmount: 1, remainingSlots: 1 } }
    ).lean<{ pendingAmounts: number[]; remainingAmount: number; remainingSlots: number } | null>();

    if (!before || !before.pendingAmounts?.length) {
      return NextResponse.json(
        { message: "দুঃখিত, সব সালামি এই মুহূর্তে বিতরণ হয়ে গেছে।" },
        { status: 409 }
      );
    }

    // The element $pop removed is the last one in the pre-update array.
    const amount = before.pendingAmounts[before.pendingAmounts.length - 1];
    const claimId = uid.rnd();
    const claimToken = tokenUid.rnd();

    // Adjust the running total only. The claim record itself lives in the
    // Claim collection (created below) — the session no longer keeps an
    // embedded claims array, so the document stays tiny at any scale.
    await SessionModel.updateOne({ sessionId }, { $inc: { remainingAmount: -amount } });

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
      remainingSlots: before.remainingSlots - 1,
      remainingAmount: before.remainingAmount - amount,
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
