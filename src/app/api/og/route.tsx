import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "card";
  const name = searchParams.get("name") || "Winner";
  const rawAmount = searchParams.get("amount") ?? "0";
  const amountNum = Number(rawAmount);
  const amountStr = isNaN(amountNum) ? "?" : amountNum.toLocaleString("en-US");

  /* ── Helper divs (Satori requires explicit display:flex on every container) ── */
  const bg = "linear-gradient(150deg, #031a14 0%, #062e28 35%, #0a4a3f 65%, #052a22 100%)";

  /* ══════════════════════════════════════════════
     HOME layout
  ══════════════════════════════════════════════ */
  if (type === "home") {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", background: bg, fontFamily: "sans-serif", position: "relative", overflow: "hidden" }}>
          {/* corner glow top-left */}
          <div style={{ position: "absolute", top: -120, left: -120, width: 480, height: 480, borderRadius: 999, background: "radial-gradient(circle, rgba(212,168,83,0.18) 0%, transparent 65%)", display: "flex" }} />
          {/* corner glow bottom-right */}
          <div style={{ position: "absolute", bottom: -100, right: -100, width: 400, height: 400, borderRadius: 999, background: "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 65%)", display: "flex" }} />
          {/* top gold bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 7, background: "linear-gradient(90deg,#92700a,#fcd34d,#d4a853,#fcd34d,#92700a)", display: "flex" }} />
          {/* bottom gold bar */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 7, background: "linear-gradient(90deg,#92700a,#fcd34d,#d4a853,#fcd34d,#92700a)", display: "flex" }} />

          {/* left column — decorative */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 320, paddingLeft: 40 }}>
            <div style={{ fontSize: 160, lineHeight: 1, display: "flex" }}>🌙</div>
            <div style={{ fontSize: 70, lineHeight: 1, marginTop: 16, display: "flex" }}>🕌</div>
            <div style={{ fontSize: 50, lineHeight: 1, marginTop: 10, opacity: 0.5, display: "flex" }}>✦ ✧ ✦</div>
          </div>

          {/* right column — main content */}
          <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", paddingRight: 64, paddingLeft: 24 }}>
            {/* badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(212,168,83,0.12)", border: "2px solid rgba(212,168,83,0.45)", borderRadius: 999, padding: "10px 28px", width: "fit-content", marginBottom: 32 }}>
              <div style={{ fontSize: 26, color: "#fde68a", display: "flex" }}>🎁 Eid Mubarak</div>
            </div>

            {/* title */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 88, fontWeight: 800, color: "#f0fdf4", lineHeight: 1, display: "flex" }}>Eid Salami</div>
              <div style={{ fontSize: 88, fontWeight: 800, color: "#fcd34d", lineHeight: 1.1, display: "flex" }}>Spin Wheel</div>
            </div>

            {/* divider */}
            <div style={{ width: 360, height: 4, borderRadius: 2, background: "linear-gradient(90deg,#d4a853,#fcd34d,transparent)", marginTop: 28, marginBottom: 28, display: "flex" }} />

            {/* tagline */}
            <div style={{ fontSize: 34, color: "#a7f3d0", lineHeight: 1.5, display: "flex" }}>
              Surprise your loved ones with a spin-wheel gift 🎰
            </div>

            {/* site url */}
            <div style={{ marginTop: 32, fontSize: 26, color: "rgba(212,168,83,0.6)", display: "flex" }}>
              eid-salami-for-u.vercel.app
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  /* ══════════════════════════════════════════════
     CARD / WINNER layout
  ══════════════════════════════════════════════ */
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: bg, fontFamily: "sans-serif", position: "relative", overflow: "hidden" }}>
        {/* glow top-right */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 420, height: 420, borderRadius: 999, background: "radial-gradient(circle, rgba(212,168,83,0.2) 0%, transparent 65%)", display: "flex" }} />
        {/* glow bottom-left */}
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 380, height: 380, borderRadius: 999, background: "radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 65%)", display: "flex" }} />
        {/* diagonal accent strip */}
        <div style={{ position: "absolute", top: 0, right: 180, width: 3, height: "100%", background: "linear-gradient(180deg,transparent,rgba(212,168,83,0.25),transparent)", display: "flex" }} />
        <div style={{ position: "absolute", top: 0, right: 220, width: 1, height: "100%", background: "linear-gradient(180deg,transparent,rgba(212,168,83,0.1),transparent)", display: "flex" }} />
        {/* top gold bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 7, background: "linear-gradient(90deg,#92700a,#fcd34d,#d4a853,#fcd34d,#92700a)", display: "flex" }} />
        {/* bottom gold bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 7, background: "linear-gradient(90deg,#92700a,#fcd34d,#d4a853,#fcd34d,#92700a)", display: "flex" }} />

        {/* main centered content */}
        <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 80px" }}>
          {/* top badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(212,168,83,0.1)", border: "2px solid rgba(212,168,83,0.4)", borderRadius: 999, padding: "12px 36px", marginBottom: 36 }}>
            <div style={{ fontSize: 30, color: "#fde68a", display: "flex" }}>🌙 Eid Mubarak — Salami Winner!</div>
          </div>

          {/* winner name */}
          <div style={{ fontSize: 62, fontWeight: 700, color: "#f0fdf4", textAlign: "center", marginBottom: 16, maxWidth: 900, display: "flex" }}>
            🎉 {name}
          </div>

          {/* amount — hero element */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 8 }}>
            <div style={{ fontSize: 52, fontWeight: 700, color: "#fbbf24", marginTop: 22, marginRight: 10, display: "flex" }}>BDT</div>
            <div style={{ fontSize: 160, fontWeight: 900, color: "#fcd34d", lineHeight: 1, display: "flex", letterSpacing: "-4px" }}>
              {amountStr}
            </div>
          </div>

          {/* gold divider */}
          <div style={{ width: 500, height: 4, borderRadius: 2, background: "linear-gradient(90deg,transparent,#fcd34d,transparent)", marginTop: 16, marginBottom: 28, display: "flex" }} />

          {/* sub-line */}
          <div style={{ fontSize: 32, color: "#a7f3d0", textAlign: "center", display: "flex" }}>
            Claimed via Eid Salami Spin Wheel 🎰
          </div>

          {/* site url */}
          <div style={{ marginTop: 24, fontSize: 24, color: "rgba(212,168,83,0.55)", display: "flex" }}>
            eid-salami-for-u.vercel.app
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
