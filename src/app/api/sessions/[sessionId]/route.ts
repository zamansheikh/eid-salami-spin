import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { SessionModel } from "@/models/Session";

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

    return NextResponse.json({
      sessionId: session.sessionId,
      organizerName: session.organizerName,
      totalAmount: session.totalAmount,
      peopleCount: session.peopleCount,
      remainingAmount: session.remainingAmount,
      remainingSlots: session.remainingSlots,
      claims: session.claims,
      createdAt: session.createdAt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "সেশন তথ্য লোড করা যায়নি।",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
