import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Eid Salami Spin Wheel - Win Exciting Prizes!",
  description:
    "Celebrate Eid with a chance to win Salami prizes! Spin the wheel and claim your Eid gift now. Limited to one spin per person, don't miss out!",
  openGraph: {
    title: "Eid Mubarak! 🌙 Spin & Win Your Eid Salami",
    description:
      "Celebrate Eid with a chance to win exciting Salami prizes! Spin the wheel and claim your Eid gift now. Limited to one spin per person!",
    images: [
      {
        url: "https://sjc.microlink.io/6TrOQsGet7G6dEwKN-45J2q0ZWFxrXkzMPBZXLois3wbAHVZ1lAq2W4h0f4A2CyGSi3bqks0J4hhytkz-B-5zw.jpeg", // This is a placeholder - replace with your actual Eid banner image
        width: 1200,
        height: 630,
        alt: "Eid Mubarak Spin Wheel",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eid Mubarak! 🌙 Spin & Win Your Eid Salami",
    description:
      "Celebrate Eid with a chance to win exciting Salami prizes! Spin the wheel and claim your Eid gift now. Limited to one spin per person!",
    images: [
      "https://sjc.microlink.io/6TrOQsGet7G6dEwKN-45J2q0ZWFxrXkzMPBZXLois3wbAHVZ1lAq2W4h0f4A2CyGSi3bqks0J4hhytkz-B-5zw.jpeg",
    ], // This is a placeholder - replace with your actual Eid banner image
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'