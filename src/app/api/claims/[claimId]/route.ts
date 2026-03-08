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
export async function PATCH(request: Request, context: Context) {
  try {
    await connectToDatabase();
    const { claimId } = await context.params;

    const body = await request.json() as { method?: string; number?: string; claimToken?: string };
    const { method, number, claimToken } = body;

    if (!method || !["bkash", "nagad", "rocket"].includes(method)) {
      return NextResponse.json(
        { message: "Valid payment method required (bkash, nagad, or rocket)." },
        { status: 400 }
      );
    }

    const trimmedNumber = (number ?? "").trim();
    if (!trimmedNumber) {
      return NextResponse.json(
        { message: "Phone number is required." },
        { status: 400 }
      );
    }

    if (!claimToken) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 403 }
      );
    }

    const claim = await ClaimModel.findOne({ claimId, claimToken }).lean();
    if (!claim) {
      return NextResponse.json(
        { message: "এই সালামি কার্ড পাওয়া যায়নি অথবা টোকেন সঠিক নয়।" },
        { status: 403 }
      );
    }

    if (claim.paymentRequest?.requestedAt) {
      return NextResponse.json(
        { message: "Payment request already submitted." },
        { status: 409 }
      );
    }

    await ClaimModel.updateOne(
      { claimId },
      {
        $set: {
          "paymentRequest.method": method,
          "paymentRequest.number": trimmedNumber,
          "paymentRequest.requestedAt": new Date(),
        },
      }
    );

    return NextResponse.json({ message: "Payment request submitted." });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Request could not be saved.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}