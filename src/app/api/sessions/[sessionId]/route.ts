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

    // Enrich claims with paymentRequest data from Claim collection.
    // Fetch only the two fields we need (claimId is indexed).
    const claimIds = (session.claims ?? []).map((c: { claimId: string }) => c.claimId);
    const fullClaims = claimIds.length
      ? await ClaimModel.find({ claimId: { $in: claimIds } })
          .select("claimId paymentRequest -_id")
          .lean()
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
      // The exact amounts still up for grabs — used to render real values on
      // the spin wheel. The claim picks one of these at random, so showing
      // them can't be gamed (you can't choose which one you get).
      pendingAmounts: session.pendingAmounts ?? [],
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
    const body = (await request.json()) as {
      organizerName?: string;
      newTotalAmount?: number;
      newRemainingSlots?: number;
    };

    const session = await SessionModel.findOne({ sessionId });
    if (!session) {
      return NextResponse.json({ message: "Session not found." }, { status: 404 });
    }

    // What's already been won can never change.
    const claimedCount = session.claims?.length ?? session.peopleCount - session.remainingSlots;
    const alreadyDistributed = session.totalAmount - session.remainingAmount;

    // ── Validate the organizer name (if being edited) ────────────
    const previousName = session.organizerName;
    let nextName = previousName;
    if (body.organizerName !== undefined) {
      nextName = String(body.organizerName).trim();
      if (!nextName) {
        return NextResponse.json({ message: "Organizer name cannot be empty." }, { status: 400 });
      }
    }

    // Fall back to current values when a field isn't being edited.
    const targetTotal =
      body.newTotalAmount === undefined ? session.totalAmount : Number(body.newTotalAmount);
    const targetSlots =
      body.newRemainingSlots === undefined ? session.remainingSlots : Number(body.newRemainingSlots);

    if (!Number.isInteger(targetTotal) || targetTotal <= 0) {
      return NextResponse.json({ message: "Invalid budget amount." }, { status: 400 });
    }
    if (!Number.isInteger(targetSlots) || targetSlots < 0) {
      return NextResponse.json({ message: "Invalid remaining slots." }, { status: 400 });
    }

    // Validate the budget/slot combination BEFORE mutating anything.
    if (targetSlots > 0) {
      if (targetTotal <= alreadyDistributed) {
        return NextResponse.json(
          { message: `Budget must be greater than already distributed amount (${alreadyDistributed} BDT).` },
          { status: 400 }
        );
      }
      if (targetTotal - alreadyDistributed < targetSlots) {
        return NextResponse.json(
          { message: `Budget must leave at least 1 BDT per remaining person (${targetSlots} people left).` },
          { status: 400 }
        );
      }
    }

    // ── Apply changes ────────────────────────────────────────────
    session.organizerName = nextName;

    if (targetSlots === 0) {
      // Closing out: forfeit any leftover, lock budget to what was distributed.
      session.totalAmount = alreadyDistributed;
      session.remainingAmount = 0;
      session.remainingSlots = 0;
      session.peopleCount = claimedCount;
      session.pendingAmounts = [];
    } else {
      const newRemainingAmount = targetTotal - alreadyDistributed;
      session.totalAmount = targetTotal;
      session.remainingAmount = newRemainingAmount;
      session.remainingSlots = targetSlots;
      session.peopleCount = claimedCount + targetSlots;
      session.pendingAmounts = generateRandomDistribution(newRemainingAmount, targetSlots);
    }

    await session.save();

    // Keep already-issued cards in sync with the new organizer name.
    if (nextName !== previousName) {
      await ClaimModel.updateMany({ sessionId }, { $set: { organizerName: nextName } });
    }

    return NextResponse.json({
      message: "Session updated successfully.",
      organizerName: session.organizerName,
      totalAmount: session.totalAmount,
      remainingAmount: session.remainingAmount,
      remainingSlots: session.remainingSlots,
      peopleCount: session.peopleCount,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Update failed.", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
