"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  siDocker,
  siFigma,
  siFirebase,
  siGit,
  siGithub,
  siJavascript,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPostgresql,
  siPrisma,
  siPython,
  siReact,
  siTailwindcss,
  siThreedotjs,
  siTypescript,
  siVercel,
  siVitest,
} from "simple-icons";

// Most-used first: phones show the first 12.
const ICONS = [
  siTypescript,
  siReact,
  siNextdotjs,
  siPython,
  siNodedotjs,
  siDocker,
  siPostgresql,
  siTailwindcss,
  siOpenjdk,
  siGithub,
  siFigma,
  siVercel,
  siJavascript,
  siFirebase,
  siPrisma,
  siGit,
  siThreedotjs,
  siVitest,
];
const PHONE_COUNT = 12;

function luminance(hex: string) {
  const c = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = c.map((v) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Brand colours, swapped for ink when they'd vanish against the card.
const STYLED = ICONS.map((icon) => {
  const lum = luminance(icon.hex);

  return {
    ...icon,
    light: lum > 0.72 ? "var(--ink-2)" : `#${icon.hex}`,
    dark: lum < 0.07 ? "var(--ink)" : `#${icon.hex}`,
  };
});

/** An even spread of `n` points over a sphere (Fibonacci lattice). */
const lattice = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = i * Math.PI * (3 - Math.sqrt(5));

    return [Math.cos(a) * r, y, Math.sin(a) * r] as const;
  });

/** The toolbox as a sphere of brand marks: drag to spin, hover to read. */
export function TechSphere() {
  const stageRef = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLSpanElement | null)[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rx = -0.35;
    let ry = 0.4;
    let vx = 0;
    let vy = still ? 0 : 0.0035;
    let frame = 0;
    let visible = false;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let count = ICONS.length;
    let points = lattice(count);

    // Thin the sphere out on small tiles so the marks never crowd.
    const fit = () => {
      const next = stage.clientWidth < 200 ? PHONE_COUNT : ICONS.length;

      if (next !== count) {
        count = next;
        points = lattice(count);
      }
      items.current.forEach((el, i) => {
        if (el) el.style.display = i < count ? "" : "none";
      });
    };

    const render = () => {
      const chip = stage.clientWidth < 200 ? 26 : 34;
      // Size the sphere to the space it has, leaving room for the nearest chips.
      const radius = Math.max(
        24,
        Math.min(stage.clientWidth, stage.clientHeight) / 2 - chip * 0.62,
      );
      const cx = Math.cos(rx);
      const sx = Math.sin(rx);
      const cy = Math.cos(ry);
      const sy = Math.sin(ry);

      points.forEach(([x, y, z], i) => {
        const el = items.current[i];

        if (!el) return;
        // Rotate around Y, then X.
        const x1 = x * cy + z * sy;
        const z1 = -x * sy + z * cy;
        const y2 = y * cx - z1 * sx;
        const z2 = y * sx + z1 * cx;
        const depth = (z2 + 1) / 2;

        el.style.transform = `translate3d(${(x1 * radius).toFixed(1)}px, ${(y2 * radius).toFixed(1)}px, 0) scale(${(0.62 + depth * 0.5).toFixed(3)})`;
        el.style.opacity = (0.45 + depth * 0.55).toFixed(2);
        el.style.zIndex = String(Math.round(depth * 100));
      });
    };
    const loop = () => {
      frame = 0;
      if (!visible || document.hidden) return;
      if (!dragging) {
        ry += vy;
        rx += vx;
        vx *= 0.96;
        vy = vy * 0.97 + (still ? 0 : 0.0035) * 0.03;
      }
      render();
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };

    fit();
    render();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    const ro = new ResizeObserver(() => {
      fit();
      render();
    });

    io.observe(stage);
    ro.observe(stage);

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      stage.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;

      lastX = e.clientX;
      lastY = e.clientY;
      ry += dx * 0.01;
      rx -= dy * 0.01;
      vy = dx * 0.0016;
      vx = -dy * 0.0016;
      render();
    };
    const onUp = () => {
      dragging = false;
      start();
    };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div className="relative flex h-full flex-col p-4 sm:p-5">
      <p className="font-display text-[17px] font-semibold tracking-[-0.005em]">
        Toolbox
      </p>
      <div
        ref={stageRef}
        className="relative my-1 min-h-0 flex-1 cursor-grab touch-none select-none active:cursor-grabbing"
        data-nodrag
      >
        {STYLED.map((icon, i) => (
          <span
            key={icon.slug}
            ref={(el) => {
              items.current[i] = el;
            }}
            className="absolute top-1/2 left-1/2 -mt-[13px] -ml-[13px] grid size-[26px] place-items-center rounded-[8px] bg-card text-[var(--c)] shadow-[0_2px_8px_-2px_rgb(0_0_0/0.18)] ring-1 ring-line will-change-transform sm:-mt-[17px] sm:-ml-[17px] sm:size-[34px] sm:rounded-[10px] dark:bg-card-2 dark:text-[var(--cd)]"
            data-cursor={icon.title}
            style={{ "--c": icon.light, "--cd": icon.dark } as CSSProperties}
            onPointerEnter={() => setActive(icon.title)}
            onPointerLeave={() => setActive(null)}
          >
            <svg
              aria-label={icon.title}
              className="size-[14px] sm:size-[17px]"
              fill="currentColor"
              role="img"
              viewBox="0 0 24 24"
            >
              <path d={icon.path} />
            </svg>
          </span>
        ))}
      </div>
      <p
        aria-live="polite"
        className="h-4 text-center text-[12px] text-muted max-sm:hidden"
      >
        {active ?? "Drag to spin"}
      </p>
    </div>
  );
}
