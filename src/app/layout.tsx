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
		"ঈদের সালামি সুন্দরভাবে ভাগ করুন, স্পিন করে জিতুন, কার্ড শেয়ার করুন।",	metadataBase: new URL("https://eid-salami-for-u.vercel.app"),
	openGraph: {
		title: "🌙 ঈদ সালামি | Eid Salami Wheel",
		description: "প্রিয়জনদের জন্য ঈদ সালামি তৈরি করুন, স্পিন হুইলে সবাই আনন্দে নিজের অংশ জিতবে! 🎁",
		url: "https://eid-salami-for-u.vercel.app",
		siteName: "Eid Salami Wheel",
		locale: "bn_BD",
		type: "website",
		images: [
			{
				url: "/api/og?name=ঈদ%20সালামি%20চাকা&amount=🎁",
				width: 1200,
				height: 630,
				alt: "Eid Salami Wheel",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "🌙 ঈদ সালামি | Eid Salami Wheel",
		description: "প্রিয়জনদের জন্য ঈদ সালামি তৈরি করুন, স্পিন হুইলে সবাই আনন্দে নিজের অংশ জিতবে!",
		images: ["/api/og?name=ঈদ%20সালামি%20চাকা&amount=🎁"],
	},};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="bn">
			<body className={`${arefRuqaaInk.variable} ${hindSiliguri.variable}`}>
				{/* Floating Islamic decorations */}
				<span className="decor decor-1" aria-hidden="true">🌙</span>
				<span className="decor decor-2" aria-hidden="true">✦</span>
				<span className="decor decor-3" aria-hidden="true">🕌</span>
				<span className="decor decor-4" aria-hidden="true">☪</span>
				<span className="decor decor-5" aria-hidden="true">✧</span>
				<span className="decor decor-6" aria-hidden="true">🌟</span>
				{children}
				<footer style={{
					textAlign: "center",
					padding: "1.2rem 1rem 1.5rem",
					marginTop: "1rem",
					borderTop: "1px solid rgba(255,255,255,0.05)",
				}}>
					<p style={{ margin: 0, color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", lineHeight: 2 }}>
						Developed by{" "}
						<span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Md. Shamsuzzaman</span>
						{" · "}
						<a
							href="https://github.com/zamansheikh"
							target="_blank"
							rel="noopener noreferrer"
							style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
						>
							GitHub
						</a>
						{" · "}
						<a
							href="https://facebook.com/zamansheikh.404"
							target="_blank"
							rel="noopener noreferrer"
							style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
						>
							Facebook
						</a>
					</p>
				</footer>
			</body>
		</html>
	);
}

