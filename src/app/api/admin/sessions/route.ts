import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { SessionModel } from "@/models/Session";
import { ClaimModel } from "@/models/Claim";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { pin?: string };

    if (!body.pin || body.pin !== process.env.ADMIN_PIN) {
      return NextResponse.json({ message: "Invalid PIN." }, { status: 401 });
    }

    await connectToDatabase();

    // Only fetch the lightweight summary fields — never the (potentially huge)
    // claims[] or pendingAmounts[] arrays. claimedCount is derivable from
    // peopleCount - remainingSlots, so the list stays fast at any scale.
    const sessions = await SessionModel.find({})
      .select("sessionId organizerName totalAmount peopleCount remainingSlots remainingAmount createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const data = sessions.map((s) => ({
      sessionId: s.sessionId,
      organizerName: s.organizerName,
      totalAmount: s.totalAmount,
      peopleCount: s.peopleCount,
      remainingSlots: s.remainingSlots,
      remainingAmount: s.remainingAmount,
      claimedCount: Math.max(0, s.peopleCount - s.remainingSlots),
      createdAt: s.createdAt,
    }));

    return NextResponse.json({ sessions: data });
  } catch (error) {
    return NextResponse.json(
      { message: "Server error.", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

// Delete a session and all of its claims (PIN-protected).
export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as { pin?: string; sessionId?: string };

    if (!body.pin || body.pin !== process.env.ADMIN_PIN) {
      return NextResponse.json({ message: "Invalid PIN." }, { status: 401 });
    }
    if (!body.sessionId) {
      return NextResponse.json({ message: "sessionId is required." }, { status: 400 });
    }

    await connectToDatabase();

    const result = await SessionModel.deleteOne({ sessionId: body.sessionId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Session not found." }, { status: 404 });
    }
    await ClaimModel.deleteMany({ sessionId: body.sessionId });

    return NextResponse.json({ message: "Session deleted.", sessionId: body.sessionId });
  } catch (error) {
    return NextResponse.json(
      { message: "Delete failed.", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
