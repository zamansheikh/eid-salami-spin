import type { Metadata } from "next";
import { Aref_Ruqaa_Ink, Hind_Siliguri } from "next/font/google";
import "./globals.css";

const arefRuqaaInk = Aref_Ruqaa_Ink({
	variable: "--font-display",
	subsets: ["arabic"],
	weight: ["400", "700"],
});

const hindSiliguri = Hind_Siliguri({
	variable: "--font-bangla",
	subsets: ["bengali", "latin"],
	weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
	title: "ঈদ সালামি | Eid Salami Wheel",
	description:
		"ঈদের সালামি সুন্দরভাবে ভাগ করুন, স্পিন করে জিতুন, কার্ড শেয়ার করুন।",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="bn">
			<body className={`${arefRuqaaInk.variable} ${hindSiliguri.variable}`}>
				{children}
			</body>
		</html>
	);
}

