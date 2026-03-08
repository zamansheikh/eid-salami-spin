import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ঈদ সালামি 🌙 | Eid Salami",
  description: "ঈদের আনন্দে প্রিয়জনদের সালামি দিন! স্পিন করুন, সালামি জিতুন, এবং ভাগ করুন! 🎉",
  openGraph: {
    title: "ঈদ সালামি 🌙",
    description: "ঈদের আনন্দে প্রিয়জনদের সালামি দিন! স্পিন করুন এবং সালামি জিতুন! 🎉",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <div className="islamic-pattern" />
        {children}
      </body>
    </html>
  );
}
