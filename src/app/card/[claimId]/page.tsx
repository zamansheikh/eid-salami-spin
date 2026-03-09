import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import { formatBdt, getBaseUrl } from "@/lib/utils";
import { ClaimModel } from "@/models/Claim";
import CardClient from "./CardClient";

type PageProps = {
  params: Promise<{ claimId: string }>;
};

async function findClaim(claimId: string) {
  await connectToDatabase();
  return ClaimModel.findOne({ claimId }).lean();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { claimId } = await params;
  const claim = await findClaim(claimId);

  if (!claim) {
    return {
      title: "কার্ড পাওয়া যায়নি",
    };
  }

  const baseUrl = getBaseUrl();
  const cardUrl = `${baseUrl}/card/${claimId}`;
  const ogUrl = `${baseUrl}/api/og?type=card&name=${encodeURIComponent(claim.recipientName)}&amount=${claim.amount}`;

  return {
    title: `🌙 ${claim.recipientName} জিতেছে ৳${formatBdt(claim.amount)} ঈদ সালামি!`,
    description: `${claim.recipientName} ঈদ সালামি হুইলে ৳${formatBdt(claim.amount)} পেয়েছে! তুমিও তোমার প্রিয়জনদের জন্য সালামি তৈরি করো 🎁`,
    openGraph: {
      title: `🌙 ${claim.recipientName} পেয়েছে ৳${formatBdt(claim.amount)} ঈদ সালামি!`,
      description: `ঈদ সালামি হুইলে ${claim.recipientName} জিতেছে ৳${formatBdt(claim.amount)}! তুমিও তোমার প্রিয়জনদের সালামি দাও 🎁`,
      url: cardUrl,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `${claim.recipientName} - Eid Salami Winner` }],
      type: "website",
      siteName: "Eid Salami Wheel",
    },
    twitter: {
      card: "summary_large_image",
      title: `🌙 ${claim.recipientName} পেয়েছে ৳${formatBdt(claim.amount)} সালামি!`,
      description: `ঈদ সালামি হুইলে জিতেছে! তুমিও সালামি দাও 🎁`,
      images: [ogUrl],
    },
  };
}

export default async function CardPage({ params }: PageProps) {
  const { claimId } = await params;
  const claim = await findClaim(claimId);

  if (!claim) {
    notFound();
  }

  return (
    <CardClient
      claimId={claim.claimId}
      recipientName={claim.recipientName}
      organizerName={claim.organizerName}
      amount={claim.amount}
      createdAt={String(claim.createdAt)}
    />
  );
}
