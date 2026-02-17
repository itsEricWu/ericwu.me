import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Eric Wu - Full Stack Developer & Data Scientist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0b0f11 0%, #1a1f25 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Eric Wu
          </h1>
          <p
            style={{
              fontSize: 32,
              color: "#8cc9fe",
              margin: 0,
              letterSpacing: "0.05em",
            }}
          >
            Full Stack Developer & Data Scientist
          </p>
          <p
            style={{
              fontSize: 24,
              color: "#888888",
              margin: 0,
              marginTop: "8px",
            }}
          >
            ericwu.me
          </p>
        </div>
      </div>
    ),
    { ...size },
  );
}
