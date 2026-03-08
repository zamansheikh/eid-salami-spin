import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { SessionModel } from "@/models/Session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { pin?: string };

    if (!body.pin || body.pin !== process.env.ADMIN_PIN) {
      return NextResponse.json({ message: "Invalid PIN." }, { status: 401 });
    }

    await connectToDatabase();

    const sessions = await SessionModel.find({})
      .sort({ createdAt: -1 })
      .lean();

    const data = sessions.map((s) => ({
      sessionId: s.sessionId,
      organizerName: s.organizerName,
      totalAmount: s.totalAmount,
      peopleCount: s.peopleCount,
      remainingSlots: s.remainingSlots,
      remainingAmount: s.remainingAmount,
      claimedCount: s.claims?.length ?? 0,
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
