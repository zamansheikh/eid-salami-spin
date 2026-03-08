import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || "সালামি বিজয়ী";
  const amount = searchParams.get("amount") || "0";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "52px",
          background:
            "linear-gradient(145deg, #0b7a6e 0%, #0f4f54 45%, #d79a00 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 42, opacity: 0.92 }}>🌙 Eid Salami Winner Card</div>
        <div>
          <div style={{ fontSize: 56, fontWeight: 700 }}>{name}</div>
          <div style={{ fontSize: 74, color: "#fde68a", marginTop: 10 }}>
            ৳ {amount}
          </div>
        </div>
        <div style={{ fontSize: 34, opacity: 0.9 }}>ঈদের আনন্দ ভাগ করুন</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
