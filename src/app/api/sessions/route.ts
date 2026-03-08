import { NextResponse } from "next/server";
import ShortUniqueId from "short-unique-id";
import { connectToDatabase } from "@/lib/mongodb";
import { getBaseUrl, generateRandomDistribution } from "@/lib/utils";
import { SessionModel } from "@/models/Session";

export const runtime = "nodejs";

const uid = new ShortUniqueId({ length: 8 });

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const organizerName = String(body.organizerName || "").trim() || "অজানা";
    const totalAmount = Number(body.totalAmount);
    const peopleCount = Number(body.peopleCount);

    if (!Number.isInteger(totalAmount) || !Number.isInteger(peopleCount)) {
      return NextResponse.json(
        { message: "অ্যামাউন্ট এবং মানুষের সংখ্যা অবশ্যই পূর্ণ সংখ্যা হতে হবে।" },
        { status: 400 }
      );
    }

    if (totalAmount <= 0 || peopleCount <= 0) {
      return NextResponse.json(
        { message: "অ্যামাউন্ট ও মানুষের সংখ্যা ০ এর বেশি হতে হবে।" },
        { status: 400 }
      );
    }

    if (totalAmount < peopleCount) {
      return NextResponse.json(
        {
          message:
            "ন্যূনতম ১ টাকা করে দিতে চাইলে মোট অ্যামাউন্ট অবশ্যই মানুষের সংখ্যার সমান বা বেশি হতে হবে।",
        },
        { status: 400 }
      );
    }

    const pendingAmounts = generateRandomDistribution(totalAmount, peopleCount);
    const sessionId = uid.rnd();

    await SessionModel.create({
      sessionId,
      organizerName,
      totalAmount,
      peopleCount,
      remainingAmount: totalAmount,
      remainingSlots: peopleCount,
      pendingAmounts,
      claims: [],
    });

    const baseUrl = getBaseUrl();

    return NextResponse.json({
      sessionId,
      shareUrl: `${baseUrl}/s/${sessionId}`,
      creatorUrl: `${baseUrl}/created/${sessionId}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "সেশন তৈরি করা যায়নি। পরে আবার চেষ্টা করুন।",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
