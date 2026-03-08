import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { SessionModel } from "@/models/Session";
import { ClaimModel } from "@/models/Claim";
import { generateRandomDistribution } from "@/lib/utils";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(_request: Request, context: Context) {
  try {
    await connectToDatabase();
    const { sessionId } = await context.params;

    const session = await SessionModel.findOne({ sessionId }).lean();

    if (!session) {
      return NextResponse.json(
        { message: "এই সালামি সেশনটি পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    // Enrich claims with paymentRequest data from Claim collection
    const claimIds = (session.claims ?? []).map((c: { claimId: string }) => c.claimId);
    const fullClaims = claimIds.length
      ? await ClaimModel.find({ claimId: { $in: claimIds } }).lean()
      : [];
    const payMap = Object.fromEntries(
      fullClaims.map((c) => [c.claimId, c.paymentRequest ?? null])
    );
    const enrichedClaims = (session.claims ?? []).map((c: { claimId: string }) => ({
      ...(c as object),
      paymentRequest: payMap[c.claimId] ?? null,
    }));

    return NextResponse.json({
      sessionId: session.sessionId,
      organizerName: session.organizerName,
      totalAmount: session.totalAmount,
      peopleCount: session.peopleCount,
      remainingAmount: session.remainingAmount,
      remainingSlots: session.remainingSlots,
      claims: enrichedClaims,
      createdAt: session.createdAt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Session info could not be loaded.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    await connectToDatabase();
    const { sessionId } = await context.params;
    const body = await request.json() as { newTotalAmount?: number };
    const newTotal = Number(body.newTotalAmount);

    if (!Number.isInteger(newTotal) || newTotal <= 0) {
      return NextResponse.json({ message: "Invalid amount." }, { status: 400 });
    }

    const session = await SessionModel.findOne({ sessionId });
    if (!session) {
      return NextResponse.json({ message: "Session not found." }, { status: 404 });
    }

    const alreadyDistributed = session.totalAmount - session.remainingAmount;

    if (newTotal <= alreadyDistributed) {
      return NextResponse.json(
        { message: `New budget must be greater than already distributed amount (${alreadyDistributed} BDT).` },
        { status: 400 }
      );
    }

    if (session.remainingSlots === 0) {
      return NextResponse.json({ message: "All slots are already claimed." }, { status: 400 });
    }

    const newRemainingAmount = newTotal - alreadyDistributed;

    if (newRemainingAmount < session.remainingSlots) {
      return NextResponse.json(
        { message: `New budget must leave at least 1 BDT per remaining person (${session.remainingSlots} people left).` },
        { status: 400 }
      );
    }

    const newPendingAmounts = generateRandomDistribution(newRemainingAmount, session.remainingSlots);

    session.totalAmount = newTotal;
    session.remainingAmount = newRemainingAmount;
    session.pendingAmounts = newPendingAmounts;
    await session.save();

    return NextResponse.json({ message: "Budget updated successfully.", totalAmount: newTotal, remainingAmount: newRemainingAmount });
  } catch (error) {
    return NextResponse.json(
      { message: "Update failed.", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
