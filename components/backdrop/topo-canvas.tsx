"use client";

import { useEffect, useRef } from "react";

import { onIdle } from "@/lib/utils";

type TopoFile = {
  w: number;
  h: number;
  summit: [number, number];
  levels: { e: number; l: number[][] }[];
};

type Topo = Omit<TopoFile, "levels"> & {
  levels: { e: number; lines: Float32Array[] }[];
};

function decode(file: TopoFile): Topo {
  return {
    ...file,
    levels: file.levels.map(({ e, l }) => ({
      e,
      lines: l.map((flat) => {
        const pts = new Float32Array(flat.length);
        let x = 0;
        let y = 0;

        for (let i = 0; i < flat.length; i += 2) {
          x += flat[i];
          y += flat[i + 1];
          pts[i] = x;
          pts[i + 1] = y;
        }

        return pts;
      }),
    })),
  };
}

/** Where the summit sits on screen, and how much to scale so the map covers the viewport. */
function layout(topo: Topo, w: number, h: number) {
  const narrow = w < 640;
  const sx = w * (narrow ? 0.78 : 0.84);
  const sy = h * (narrow ? 0.06 : 0.08);
  const [ux, uy] = topo.summit;
  const s =
    Math.max(
      sx / ux,
      (w - sx) / (topo.w - ux),
      sy / uy,
      (h - sy) / (topo.h - uy),
      narrow ? 0.9 : 1.15,
    ) * 1.02;

  return { sx, sy, s, ox: sx - ux * s, oy: sy - uy * s };
}

function drawContours(
  canvas: HTMLCanvasElement,
  topo: Topo,
  color: string,
  weight: number,
) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const { s, ox, oy } = layout(topo, w, h);

  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d");

  if (!ctx) return;
  ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);
  ctx.strokeStyle = color;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  for (const level of topo.levels) {
    const index = level.e % 600 === 0;

    ctx.lineWidth = ((index ? 1.7 : 1) * weight) / s;
    ctx.globalAlpha = index ? 1 : 0.75;
    ctx.beginPath();
    for (const p of level.lines) {
      ctx.moveTo(p[0], p[1]);
      // Smooth the simplified polyline with quadratic curves through midpoints.
      for (let i = 2; i < p.length - 2; i += 2) {
        ctx.quadraticCurveTo(
          p[i],
          p[i + 1],
          (p[i] + p[i + 2]) / 2,
          (p[i + 1] + p[i + 3]) / 2,
        );
      }
      ctx.lineTo(p[p.length - 2], p[p.length - 1]);
    }
    ctx.stroke();
  }
}

/**
 * Real contour lines of Mount Rainier (Tahoma), the mountain I'm training to
 * climb, drawn once after the page is idle and again only on resize or theme
 * change, so the glass above it never has to re-blur a moving background.
 */
export function TopoCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let topo: Topo | null = null;
    let disposed = false;
    let resizeTimer = 0;
    let lastWidth = 0;

    const paint = () => {
      const canvas = canvasRef.current;

      if (!topo || disposed || !canvas) return;
      const css = getComputedStyle(document.documentElement);

      lastWidth = canvas.clientWidth;
      drawContours(canvas, topo, css.getPropertyValue("--topo").trim(), 1);
      wrapRef.current?.setAttribute("data-ready", "true");
    };

    const load = () =>
      fetch("/data/rainier-topo.json")
        .then((r) => r.json())
        .then((file: TopoFile) => {
          topo = decode(file);
          paint();
        })
        .catch(() => {});

    const cancelIdle = onIdle(load, 2500);

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        // Mobile toolbars change only the height; the backdrop is sized to the
        // large viewport, so only a width change needs a redraw.
        if (canvasRef.current?.clientWidth !== lastWidth) paint();
      }, 160);
    };
    const themeObserver = new MutationObserver(paint);

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelIdle();
      window.clearTimeout(resizeTimer);
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 opacity-0 transition-opacity duration-1000 data-[ready=true]:opacity-100"
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
