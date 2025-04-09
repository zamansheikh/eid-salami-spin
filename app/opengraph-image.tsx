import { ImageResponse } from "next/og"

// Route segment config
export const runtime = "edge"

// Image metadata
export const alt = "Eid Mubarak! Spin & Win Your Eid Salami"
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

// Image generation
export default async function Image() {
  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        fontSize: 128,
        background: "linear-gradient(to bottom, #ecfdf5, #d1fae5)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Decorative elements */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 40,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(16, 185, 129, 0.2)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 60,
          right: 60,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "rgba(245, 158, 11, 0.2)",
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
          borderRadius: 24,
          padding: 40,
          margin: 20,
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
          border: "1px solid rgba(245, 158, 11, 0.2)",
          width: "90%",
          maxWidth: 1000,
        }}
      >
        <div
          style={{
            background: "linear-gradient(to right, #f59e0b, #fbbf24, #f59e0b)",
            backgroundClip: "text",
            color: "transparent",
            fontSize: 80,
            fontWeight: "bold",
            marginBottom: 20,
          }}
        >
          Eid Mubarak
        </div>

        <div
          style={{
            fontSize: 48,
            fontWeight: "bold",
            color: "#047857",
            marginBottom: 20,
          }}
        >
          Spin & Win Your Eid Salami!
        </div>

        <div
          style={{
            fontSize: 32,
            color: "#4b5563",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          Celebrate Eid with a chance to win exciting prizes! Limited to one spin per person.
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          fontSize: 24,
          color: "#4b5563",
        }}
      >
        Developed by Zaman Sheikh
      </div>
    </div>,
    // ImageResponse options
    {
      ...size,
    },
  )
}
