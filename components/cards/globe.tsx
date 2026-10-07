"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, type CSSProperties } from "react";

const PURDUE: [number, number] = [40.4237, -86.9212];
const UCLA: [number, number] = [34.0689, -118.4452];
const SEATTLE: [number, number] = [47.6062, -122.3321];

/** Each label sits on the side of its marker that keeps the three apart. */
const LABELS: { id: string; text: string; place: CSSProperties }[] = [
  {
    id: "seattle",
    text: "Seattle · now",
    place: {
      bottom: "anchor(top)",
      left: "anchor(center)",
      translate: "-50% -7px",
    },
  },
  {
    id: "ucla",
    text: "UCLA",
    place: {
      top: "anchor(bottom)",
      left: "anchor(center)",
      translate: "-50% 7px",
    },
  },
  {
    id: "purdue",
    text: "Purdue",
    place: {
      top: "anchor(bottom)",
      left: "anchor(center)",
      translate: "-50% 7px",
    },
  },
];

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
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;

    if (!wrap || !canvas || !resolvedTheme) return;
    const dark = resolvedTheme === "dark";
    let globe: {
      update: (s: Record<string, unknown>) => void;
      destroy: () => void;
    } | null = null;
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
        dark: dark ? 1 : 0,
        diffuse: dark ? 1.4 : 1.2,
        mapSamples: 14000,
        mapBrightness: dark ? 4.5 : 7,
        mapBaseBrightness: dark ? 0.02 : 0,
        baseColor: dark ? [0.15, 0.2, 0.27] : [1, 1, 1],
        markerColor: dark ? [0.55, 0.79, 1] : [0.16, 0.53, 0.87],
        glowColor: dark ? [0.12, 0.22, 0.32] : [0.98, 0.9, 0.93],
        markers: [
          { location: SEATTLE, size: 0.075, id: "seattle" },
          { location: UCLA, size: 0.05, id: "ucla" },
          { location: PURDUE, size: 0.05, id: "purdue" },
        ],
        arcs: [
          { from: PURDUE, to: UCLA, id: "purdue-ucla" },
          { from: UCLA, to: SEATTLE, id: "ucla-seattle" },
        ],
        arcColor: dark ? [1, 0.62, 0.74] : [0.85, 0.28, 0.48],
        arcWidth: 0.7,
        arcHeight: 0.28,
        markerElevation: 0.015,
        scale: 1.3,
      });
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
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [resolvedTheme]);

  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute top-4 left-5 z-10 leading-tight sm:top-5">
        <p className="text-[15px] font-semibold">Purdue → UCLA → Seattle</p>
        <p className="text-[12px] text-muted max-sm:hidden">Drag to spin</p>
      </div>
      <div
        ref={wrapRef}
        className="absolute inset-x-[-14%] top-[24%] aspect-square sm:top-[12%]"
      >
        <canvas
          ref={canvasRef}
          aria-label="Globe showing Purdue, UCLA and Seattle"
          className="size-full cursor-grab opacity-0 transition-opacity duration-1000 active:cursor-grabbing"
          data-cursor="Spin the globe"
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
            {l.text}
          </span>
        ))}
      </div>
    </div>
  );
}
