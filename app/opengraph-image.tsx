import { ImageResponse } from "next/og";

export const alt =
  "Eric Wu - SDE II at AWS building agentic systems and generative UI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background:
          "radial-gradient(circle at 18% 12%, rgba(40,120,200,0.45), transparent 55%), radial-gradient(circle at 92% 100%, rgba(255,120,70,0.28), transparent 50%), #05070b",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        fontFamily: "sans-serif",
        color: "#e8eef7",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 22,
          letterSpacing: 4,
          color: "#8592a8",
        }}
      >
        SEATTLE, WA · 47.61° N
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            display: "flex",
            fontSize: 104,
            fontWeight: 700,
            letterSpacing: -4,
            lineHeight: 1,
          }}
        >
          Hey, I&apos;m{" "}
          <span style={{ color: "#5cc8ff", marginLeft: 24 }}>Eric.</span>
        </div>
        <div style={{ display: "flex", fontSize: 36, color: "#b7c3d4" }}>
          SDE II at AWS · agentic systems &amp; generative UI
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 24,
          color: "#8592a8",
        }}
      >
        <span>ericwu.me</span>
        <span style={{ color: "#ff8a5b" }}>▲ Rainier 2027</span>
      </div>
    </div>,
    { ...size },
  );
}
