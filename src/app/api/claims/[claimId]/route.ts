import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ClaimModel } from "@/models/Claim";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ claimId: string }>;
};

export async function GET(_request: Request, context: Context) {
  try {
    await connectToDatabase();
    const { claimId } = await context.params;

    const claim = await ClaimModel.findOne({ claimId }).lean();

    if (!claim) {
      return NextResponse.json(
        { message: "এই সালামি কার্ড পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    return NextResponse.json(claim);
  } catch (error) {
    return NextResponse.json(
      {
        message: "কার্ড লোড করা যায়নি।",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
