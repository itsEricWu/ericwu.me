"use client";

import type { COBEOptions, Globe } from "cobe";
import { useTheme } from "next-themes";
import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";

import { useT } from "@/components/locale-provider";

const PURDUE: [number, number] = [40.4237, -86.9212];
const UCLA: [number, number] = [34.0689, -118.4452];
const SEATTLE: [number, number] = [47.6062, -122.3321];

/** Each label sits on the side of its marker that keeps the three apart. */
// Each label's words live in messages/ (globe.labels).
const LABELS: { id: string; place: CSSProperties }[] = [
  {
    id: "seattle",
    place: {
      bottom: "anchor(top)",
      left: "anchor(center)",
      translate: "-50% -7px",
    },
  },
  {
    id: "ucla",
    place: {
      top: "anchor(center)",
      right: "anchor(left)",
      translate: "-7px -50%",
    },
  },
  {
    id: "purdue",
    place: {
      top: "anchor(bottom)",
      left: "anchor(center)",
      translate: "-50% 7px",
    },
  },
];

type Palette = Pick<
  COBEOptions,
  | "dark"
  | "diffuse"
  | "mapBrightness"
  | "mapBaseBrightness"
  | "baseColor"
  | "markerColor"
  | "glowColor"
  | "arcColor"
>;

const PALETTES: Record<"light" | "dark", Palette> = {
  light: {
    dark: 0,
    diffuse: 1.2,
    mapBrightness: 7,
    mapBaseBrightness: 0,
    baseColor: [1, 1, 1],
    markerColor: [0.16, 0.53, 0.87],
    glowColor: [0.98, 0.9, 0.93],
    arcColor: [0.85, 0.28, 0.48],
  },
  dark: {
    dark: 1,
    diffuse: 1.4,
    mapBrightness: 4.5,
    mapBaseBrightness: 0.02,
    baseColor: [0.15, 0.2, 0.27],
    markerColor: [0.55, 0.79, 1],
    glowColor: [0.12, 0.22, 0.32],
    arcColor: [1, 0.62, 0.74],
  },
};

/** cobe's angles that put a place at the center of the view. */
const facing = (lat: number, lon: number) => [
  Math.PI - ((lon * Math.PI) / 180 - Math.PI / 2),
  (lat * Math.PI) / 180,
];
const [HOME_PHI, HOME_THETA] = facing(40, -104);
const TAU = Math.PI * 2;

/**
 * Purdue → UCLA → Seattle on a dotted WebGL globe (cobe, ~6KB, loaded when
 * visible). It rests on North America with a slow sway; spin it and it glides
 * back.
 */
export function GlobeCard() {
  const { globe: t } = useT();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<Globe | null>(null);
  const { resolvedTheme } = useTheme();
  const palette = PALETTES[resolvedTheme === "dark" ? "dark" : "light"];
  const paletteRef = useRef(palette);
  const ready = resolvedTheme !== undefined;

  // A theme switch recolours the globe in place, in the same frame as the
  // page: rebuilding it left a frame of the old globe, then an empty card.
  useLayoutEffect(() => {
    paletteRef.current = palette;
    globeRef.current?.update(palette);
  }, [palette]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;

    if (!wrap || !canvas || !ready) return;
    let globe: Globe | null = null;
    let frame = 0;
    let visible = false;
    let disposed = false;
    let phi = HOME_PHI;
    let theta = HOME_THETA * 0.7;
    let spin = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const loop = () => {
      frame = 0;
      if (!globe || !visible || document.hidden) return;
      if (!dragging) {
        // Coast on the fling, then ease back to the home view along the shortest way round.
        const goal = HOME_PHI + 0.16 * Math.sin(performance.now() / 5200);
        const delta = ((((goal - phi) % TAU) + TAU * 1.5) % TAU) - Math.PI;

        phi += spin + delta * 0.012 * (1 - Math.min(1, Math.abs(spin) * 40));
        theta += (HOME_THETA * 0.7 - theta) * 0.02;
        spin *= 0.95;
      }
      const size = wrap.clientWidth;

      globe.update({ phi, theta, width: size * 2, height: size * 2 });
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };
    const create = async () => {
      if (globe || disposed) return;
      const { default: createGlobe } = await import("cobe");

      if (disposed) return;
      const size = wrap.clientWidth;

      globe = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: size * 2,
        height: size * 2,
        phi,
        theta,
        mapSamples: 14000,
        ...paletteRef.current,
        markers: [
          { location: SEATTLE, size: 0.075, id: "seattle" },
          { location: UCLA, size: 0.05, id: "ucla" },
          { location: PURDUE, size: 0.05, id: "purdue" },
        ],
        arcs: [
          { from: PURDUE, to: UCLA, id: "purdue-ucla" },
          { from: UCLA, to: SEATTLE, id: "ucla-seattle" },
        ],
        arcWidth: 0.7,
        arcHeight: 0.28,
        markerElevation: 0.015,
        scale: 1.3,
      });
      globeRef.current = globe;
      canvas.style.opacity = "1";
      start();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          create();
          start();
        }
      },
      { rootMargin: "120px" },
    );

    io.observe(wrap);

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;

      lastX = e.clientX;
      lastY = e.clientY;
      phi += dx * 0.008;
      theta = Math.max(-0.4, Math.min(1.1, theta + dy * 0.004));
      spin = dx * 0.0009;
    };
    const onUp = () => {
      dragging = false;
    };
    const onVisibility = () => !document.hidden && start();

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      io.disconnect();
      globe?.destroy();
      globeRef.current = null;
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ready]);

  return (
    <div className="@container relative h-full overflow-hidden">
      <div className="absolute top-5 left-5 z-10 leading-tight sm:top-6 sm:left-6">
        <p className="font-display text-[15px] leading-snug font-semibold tracking-[-0.005em] @min-[250px]:text-[17px]">
          {t.title}
        </p>
        <p className="text-[12px] text-muted @max-[220px]:hidden">{t.drag}</p>
      </div>
      {/* The globe's rim sits just under the title. On small tiles it leans
          right, so the UCLA label has room on its left. */}
      <div
        ref={wrapRef}
        className="absolute top-[30%] right-[-20%] left-[-8%] aspect-square @min-[220px]:top-[22%] @min-[220px]:right-[-14%] @min-[220px]:left-[-14%]"
      >
        <canvas
          ref={canvasRef}
          aria-label={t.aria}
          className="size-full cursor-grab opacity-0 transition-opacity duration-1000 active:cursor-grabbing"
          data-cursor={t.cursor}
          role="img"
        />
        {LABELS.map((l) => (
          <span
            key={l.id}
            className="globe-label lg pointer-events-none absolute rounded-full px-2 py-0.5 text-[10.5px] font-medium whitespace-nowrap sm:text-[11px]"
            style={
              {
                positionAnchor: `--cobe-${l.id}`,
                ...l.place,
                opacity: `var(--cobe-visible-${l.id}, 0)`,
              } as CSSProperties
            }
          >
            {t.labels[l.id]}
          </span>
        ))}
      </div>
    </div>
  );
}
