import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const alt =
  "Eric Wu - SDE II at AWS building agentic systems and generative UI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Static cuts of the site's faces (Latin subsets, OFL): Fraunces at the
// headline's soft settings (SOFT 100, opsz 144) and Figtree for the text.
const font = (file: string) =>
  readFile(join(process.cwd(), "assets/fonts/og", file));

const INK = "#17161b";
const MUTED = "#6c6874";
// The name's glacier-to-ember gradient, mixed in oklab like the site's.
const NAME =
  "#2a86dd 5%, #707ec5 27.5%, #9972ad 50%, #bb6294 72.5%, #d9487a 95%";

/** The hero card as a link preview: headline, glass period, and bio. */
export default async function Image() {
  const [display, displayItalic, text, textBold] = await Promise.all([
    font("fraunces-600-soft.ttf"),
    font("fraunces-600-soft-italic.ttf"),
    font("figtree-400.ttf"),
    font("figtree-600.ttf"),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        padding: 44,
        background:
          "radial-gradient(circle at 0% 0%, rgba(42,134,221,0.22), transparent 58%), radial-gradient(circle at 100% 100%, rgba(217,72,122,0.18), transparent 55%), #f6f2f2",
        fontFamily: "Figtree",
        color: INK,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "52px 64px 58px",
          borderRadius: 44,
          background: "rgba(255,255,255,0.66)",
          border: "1.5px solid rgba(255,255,255,0.9)",
          boxShadow:
            "0 30px 60px -30px rgba(23,22,27,0.28), 0 2px 8px -2px rgba(23,22,27,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 30, fontWeight: 600 }}>Eric Wu</span>
            <span style={{ fontSize: 24, color: MUTED }}>Seattle, WA</span>
          </div>
          <span
            style={{
              fontSize: 24,
              fontWeight: 600,
              padding: "12px 26px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.9)",
              boxShadow: "0 8px 22px -12px rgba(23,22,27,0.35)",
            }}
          >
            ericwu.me
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontFamily: "Fraunces",
            fontSize: 156,
            fontWeight: 600,
            letterSpacing: -3.5,
            lineHeight: 1,
          }}
        >
          <span>Hey, I&apos;m</span>
          <span
            style={{
              marginLeft: 38,
              paddingRight: 8,
              fontStyle: "italic",
              backgroundImage: `linear-gradient(100deg, ${NAME})`,
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Eric
          </span>
          {/* The glass period, resting on the baseline as it does in light mode. */}
          <div
            style={{
              display: "flex",
              position: "relative",
              top: -19,
              width: 32,
              height: 32,
              borderRadius: 999,
              background:
                "radial-gradient(circle at 34% 30%, #6a717d 0%, #23262d 46%, #08090b 100%)",
              boxShadow: "0 7px 12px -6px rgba(0,0,0,0.45)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 6,
                left: 8,
                width: 11,
                height: 7,
                borderRadius: 999,
                background: "rgba(255,255,255,0.75)",
              }}
            />
          </div>
        </div>
        <span style={{ fontSize: 34, lineHeight: 1.35, color: MUTED }}>
          An SDE II at AWS building agentic systems and generative UI.
        </span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: display, weight: 600, style: "normal" },
        { name: "Fraunces", data: displayItalic, weight: 600, style: "italic" },
        { name: "Figtree", data: text, weight: 400, style: "normal" },
        { name: "Figtree", data: textBold, weight: 600, style: "normal" },
      ],
    },
  );
}
