import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || "সালামি বিজয়ী";
  const amount = searchParams.get("amount") || "0";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(155deg, #052a22 0%, #0a4a3f 40%, #073d33 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -60,
            left: -60,
            width: 280,
            height: 280,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(212,168,83,0.15), transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(212,168,83,0.1), transparent 70%)",
          }}
        />

        {/* top badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 32px",
            borderRadius: 999,
            border: "2px solid rgba(212,168,83,0.4)",
            background: "rgba(212,168,83,0.1)",
            fontSize: 32,
            color: "#fde68a",
            marginBottom: 28,
          }}
        >
          🌙 Eid Salami Winner
        </div>

        {/* name */}
        <div
          style={{
            fontSize: 68,
            fontWeight: 700,
            color: "#f0fdf4",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          {name}
        </div>

        {/* amount */}
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            color: "#fcd34d",
            lineHeight: 1,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          ৳ {amount}
        </div>

        {/* separator */}
        <div
          style={{
            width: 320,
            height: 3,
            borderRadius: 2,
            background:
              "linear-gradient(90deg, transparent, #d4a853, transparent)",
            marginBottom: 24,
          }}
        />

        {/* bottom tagline */}
        <div
          style={{
            fontSize: 30,
            color: "#a7f3d0",
            opacity: 0.9,
          }}
        >
          তুমিও সালামি দাও! 🎁 eid-salami-for-u.vercel.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
