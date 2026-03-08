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
  const ogUrl = `${baseUrl}/api/og?name=${encodeURIComponent(claim.recipientName)}&amount=${claim.amount}`;

  return {
    title: `${claim.recipientName} জিতেছে ৳${formatBdt(claim.amount)} সালামি`,
    description: "ঈদ সালামি কার্ড শেয়ার করুন এবং আনন্দ ছড়িয়ে দিন।",
    openGraph: {
      title: "Eid Salami Winner",
      description: `${claim.recipientName} পেয়েছে ৳${formatBdt(claim.amount)} সালামি`,
      url: cardUrl,
      images: [ogUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: "Eid Salami Winner",
      description: `${claim.recipientName} পেয়েছে ৳${formatBdt(claim.amount)} সালামি`,
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
