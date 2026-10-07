"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { supportsBackdropRefraction } from "./displacement";
import { useLiquidGlass } from "./liquid-glass";

type Mode = "none" | "lens" | "label";

const LENS = 136;
const FINE = "(hover: hover) and (pointer: fine)";
const REDUCED = "(prefers-reduced-motion: reduce)";

const subscribe = (onChange: () => void) => {
  const queries = [window.matchMedia(FINE), window.matchMedia(REDUCED)];

  queries.forEach((q) => q.addEventListener("change", onChange));

  return () =>
    queries.forEach((q) => q.removeEventListener("change", onChange));
};
const allowed = () =>
  window.matchMedia(FINE).matches && !window.matchMedia(REDUCED).matches;

/**
 * A glass companion for the cursor (desktop only). Over images marked
 * `data-lens` it becomes a liquid-glass loupe; over anything with
 * `data-cursor="…"` it shows a small glass label describing the action.
 */
export function CursorLens() {
  const enabled = useSyncExternalStore(subscribe, allowed, () => false);

  return enabled ? <LensLayer /> : null;
}

function LensLayer() {
  const lensRef = useRef<HTMLDivElement>(null);
  const lens = useLiquidGlass(lensRef, {
    magnify: 1.5,
    bezel: 18,
    thickness: 26,
    chroma: 0.05,
    blur: 0,
    saturate: 1.05,
  });
  const pillRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("none");
  const [label, setLabel] = useState("");

  useEffect(() => {
    const canLens = supportsBackdropRefraction();
    const target = { x: -200, y: -200 };
    const lensPos = { x: -200, y: -200 };
    const pillPos = { x: -200, y: -200 };
    let frame = 0;
    let currentMode: Mode = "none";
    let currentLabel = "";

    const tick = () => {
      frame = 0;
      lensPos.x += (target.x - lensPos.x) * 0.45;
      lensPos.y += (target.y - lensPos.y) * 0.45;
      pillPos.x += (target.x - pillPos.x) * 0.22;
      pillPos.y += (target.y - pillPos.y) * 0.22;
      if (lensRef.current) {
        lensRef.current.style.translate = `${lensPos.x - LENS / 2}px ${lensPos.y - LENS / 2}px`;
      }
      if (pillRef.current) {
        pillRef.current.style.translate = `${pillPos.x + 16}px ${pillPos.y + 18}px`;
      }
      if (
        Math.abs(target.x - pillPos.x) + Math.abs(target.y - pillPos.y) >
        0.3
      ) {
        frame = requestAnimationFrame(tick);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      const el = (e.target as Element | null)?.closest?.(
        "[data-lens],[data-cursor]",
      );
      let next: Mode = "none";
      let text = "";

      if (el?.hasAttribute("data-lens") && canLens && !e.buttons) next = "lens";
      else if (el?.hasAttribute("data-cursor")) {
        next = "label";
        text = el.getAttribute("data-cursor") ?? "";
      }
      if (next !== currentMode || text !== currentLabel) {
        if (currentMode === "none") {
          lensPos.x = pillPos.x = target.x;
          lensPos.y = pillPos.y = target.y;
        }
        currentMode = next;
        currentLabel = text;
        setMode(next);
        if (text) setLabel(text);
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      if (currentMode === "none") return;
      currentMode = "none";
      currentLabel = "";
      setMode("none");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onLeave, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onLeave);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  return (
    <>
      <div
        ref={lensRef}
        aria-hidden
        className="lg pointer-events-none fixed top-0 left-0 z-[70] rounded-full transition-[opacity,scale] duration-300 ease-out [--lg-blur:0px]"
        data-refract={lens.glassProps["data-refract"]}
        style={{
          ...lens.glassProps.style,
          width: LENS,
          height: LENS,
          opacity: mode === "lens" ? 1 : 0,
          scale: mode === "lens" ? "1" : "0.3",
        }}
      >
        {lens.filter}
        <span className="lg-caustic" />
      </div>
      <div
        ref={pillRef}
        aria-hidden
        className="lg pointer-events-none fixed top-0 left-0 z-[70] rounded-full px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-[opacity,scale] duration-200 ease-out"
        style={{
          opacity: mode === "label" ? 1 : 0,
          scale: mode === "label" ? "1" : "0.6",
          transformOrigin: "0 0",
        }}
      >
        <span className="lg-caustic" />
        <span>{label}</span>
      </div>
    </>
  );
}
