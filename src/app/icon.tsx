import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #031a14 0%, #0a4a3f 100%)",
          borderRadius: 8,
          fontSize: 20,
        }}
      >
        🌙
      </div>
    ),
    { width: 32, height: 32 }
  );
}
