"use client";

import { useEffect, useRef, useState } from "react";

import { buildLensMap, type LensMap } from "@/components/glass/displacement";
import { GlassFilter, registerLight } from "@/components/glass/liquid-glass";
import { cn, prefersReducedMotion } from "@/lib/utils";

const LEAD = "Hey, I'm ";
const NAME = "Eric";
const TEXT = `${LEAD}${NAME}.`;
const BASE_WEIGHT = 640;
/** At rest the letters are fully soft; the wave sharpens what it passes and melts what it touches. */
const REST = { fontWeight: BASE_WEIGHT, fontVariationSettings: "'SOFT' 100" };
const FILTER_ID = "hero-droplet-lens";
/** Matches the wrapper's px-1/py-1, so the clone inside the lens lines up with the title. */
const PAD = 4;

const letter = (ch: string, i: number) => (
  <span
    key={i}
    className={cn("inline-block", ch === " " && "w-[0.24em]")}
    data-wave={i}
    style={REST}
  >
    {ch === " " ? " " : ch}
  </span>
);

// From small tablets up the line scales with its card (it runs ~6.4em wide).
function Title({ clone }: { clone?: boolean }) {
  return (
    <h1
      aria-hidden={clone || undefined}
      aria-label={clone ? undefined : TEXT}
      className="font-display text-[2.8rem] leading-[1.02] tracking-[-0.022em] whitespace-nowrap sm:text-[length:clamp(2.4rem,15.5cqi_+_2px,5.2rem)]"
    >
      <span aria-hidden>
        {LEAD.split("").map(letter)}
        <span className="hero-name">
          {NAME.split("").map((ch, j) => letter(ch, LEAD.length + j))}
        </span>
        <span
          className="inline-block"
          data-period={clone ? undefined : ""}
          data-wave={TEXT.length - 1}
          style={REST}
        >
          .
          {!clone && (
            <span
              className="inline-block size-0 align-baseline"
              data-baseline
            />
          )}
        </span>
      </span>
    </h1>
  );
}

/**
 * The headline. Letters melt under the cursor (Fraunces' weight and SOFT axes), and the
 * period is a bead of liquid glass: pull it and it swells into a lens that
 * magnifies whatever it passes over, stretching with speed; let go and it
 * springs home and shrinks back into a period. The lens refracts a
 * pixel-aligned copy of the title, so it works in every browser.
 */
export function HeroTitle() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);
  const relayout = useRef<() => void>(() => {});
  const [map, setMap] = useState<LensMap | null>(null);
  const [pulled, setPulled] = useState(false);

  /* ---------- Variable-weight wave ---------- */
  useEffect(() => {
    const wrap = wrapRef.current;

    if (!wrap) return;
    const groups = new Map<string, HTMLElement[]>();

    wrap.querySelectorAll<HTMLElement>("[data-wave]").forEach((el) => {
      const key = el.dataset.wave!;

      groups.set(key, [...(groups.get(key) ?? []), el]);
    });
    const originals = [
      ...wrap.querySelectorAll<HTMLElement>("[data-wave]"),
    ].filter((el) => !el.closest("[data-clone]"));
    let frame = 0;

    /** `fx` gives each letter's closeness to the wave (0 to 1), or null for rest. */
    const setWeights = (fx: (center: number) => number | null) => {
      const centers = originals.map((el) => {
        const r = el.getBoundingClientRect();

        return r.left + r.width / 2;
      });

      originals.forEach((el, i) => {
        const g = fx(centers[i]);
        const weight = g === null ? REST.fontWeight : Math.round(500 + 400 * g);
        const soft =
          g === null
            ? REST.fontVariationSettings
            : `'SOFT' ${Math.round(20 + 80 * g)}`;

        groups.get(el.dataset.wave!)?.forEach((node) => {
          node.style.fontWeight = String(weight);
          node.style.fontVariationSettings = soft;
        });
      });
      // Heavier letters are wider: keep the bead on the period as it moves.
      relayout.current();
    };
    const near = (x: number) => (c: number) =>
      Math.exp(-((c - x) ** 2) / (2 * 64 ** 2));

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const x = e.clientX;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setWeights(near(x)));
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setWeights(() => null));
    };

    // One sweep on load so touch visitors see it too.
    let sweepFrame = 0;
    let sweepTimer = 0;

    if (!prefersReducedMotion()) {
      const run = (start: number) => (now: number) => {
        const t = (now - start) / 1400;
        const r = wrap.getBoundingClientRect();

        if (t >= 1) {
          setWeights(() => null);

          return;
        }
        setWeights(near(r.left - 60 + (r.width + 120) * t));
        sweepFrame = requestAnimationFrame(run(start));
      };

      sweepTimer = window.setTimeout(() => {
        sweepFrame = requestAnimationFrame(run(performance.now()));
      }, 600);
    }

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(sweepFrame);
      window.clearTimeout(sweepTimer);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  /* ---------- The glass period ---------- */
  useEffect(() => {
    const wrap = wrapRef.current;
    const orb = orbRef.current;
    const clone = cloneRef.current;
    const handle = handleRef.current;

    if (!wrap || !orb || !clone || !handle) return;
    const unlight = registerLight(orb);
    const size = orb.offsetWidth;
    const half = size / 2;
    const still = prefersReducedMotion();

    // Real glass is subtle: a gentle loupe in the middle, light bending hard only at the rim.
    setMap(
      buildLensMap({
        width: size,
        height: size,
        radius: half,
        bezel: size * 0.3,
        thickness: size * 0.22,
        magnify: 1.18,
      }),
    );

    // Where the period's dot is, from the font's real ink bounds.
    const home = { x: 0, y: 0, s: 0.16 };
    const measure = document.createElement("canvas").getContext("2d");
    const findHome = () => {
      const period = wrap.querySelector<HTMLElement>("[data-period]");
      const base = wrap.querySelector<HTMLElement>("[data-baseline]");

      if (!period || !base) return;
      const w = wrap.getBoundingClientRect();
      const r = period.getBoundingClientRect();
      const css = getComputedStyle(period);
      const fontSize = parseFloat(css.fontSize);
      let left = 0.06 * fontSize;
      let right = 0.2 * fontSize;
      let ascent = 0.15 * fontSize;

      if (measure) {
        measure.font = `${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;
        const m = measure.measureText(".");

        left = -m.actualBoundingBoxLeft;
        right = m.actualBoundingBoxRight;
        ascent = m.actualBoundingBoxAscent;
      }
      const dot = Math.max(right - left, ascent);

      home.x = r.left - w.left + (left + right) / 2;
      home.y = base.getBoundingClientRect().top - w.top - ascent / 2;
      home.s = Math.min(0.5, (dot * 1.12) / size);
      handle.style.transform = `translate(${home.x}px, ${home.y}px)`;
    };

    // Center (x, y), scale s, and a jelly stretch along the direction of travel.
    const p = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      s: 0.16,
      vs: 0,
      def: 0,
      dv: 0,
      angle: 0,
    };
    let held = false;
    let hover = false;
    let target = { x: 0, y: 0 };

    const render = () => {
      const a = (p.angle * 180) / Math.PI;
      const s = Math.max(0.05, p.s);

      orb.style.transform = `translate(${p.x - half}px, ${p.y - half}px) rotate(${a}deg) scale(${s * (1 + p.def)}, ${
        s * (1 - p.def * 0.7)
      }) rotate(${-a}deg)`;
      // Counter-scale the copy inside so the lens always shows the title at true size and place.
      const tx = (PAD - p.x) / s - PAD + half;
      const ty = (PAD - p.y) / s - PAD + half;

      clone.style.transform = `translate(${tx}px, ${ty}px) scale(${1 / s})`;
    };

    const settle = () => {
      p.x = home.x;
      p.y = home.y;
      p.s = home.s;
      p.vx = p.vy = p.vs = p.def = p.dv = 0;
      render();
    };

    findHome();
    settle();
    orb.style.opacity = "1";

    let frame = 0;
    let last = performance.now();
    let lift = 0;

    const step = (now: number) => {
      const dt = Math.min(32, now - last) / 16.67;
      const goal = held ? target : home;
      // Hovering swells the bead a little: an invitation to pull it.
      const goalS = held ? 1 : hover ? home.s * 1.55 : home.s;

      last = now;
      if (held) {
        // Follow the finger closely, with a little lag that reads as weight.
        const nx = p.x + (goal.x - p.x) * Math.min(1, 0.45 * dt);
        const ny = p.y + (goal.y - p.y) * Math.min(1, 0.45 * dt);

        p.vx = 0.7 * p.vx + 0.3 * ((nx - p.x) / dt);
        p.vy = 0.7 * p.vy + 0.3 * ((ny - p.y) / dt);
        p.x = nx;
        p.y = ny;
      } else {
        // An underdamped spring home, so it overshoots a touch and settles.
        p.vx += ((goal.x - p.x) * 0.075 - p.vx * 0.3) * dt;
        p.vy += ((goal.y - p.y) * 0.075 - p.vy * 0.3) * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      p.vs += ((goalS - p.s) * 0.12 - p.vs * 0.5) * dt;
      p.s += p.vs * dt;

      const speed = Math.hypot(p.vx, p.vy);

      if (speed > 0.4) p.angle = Math.atan2(p.vy, p.vx);
      const stretch = Math.min(0.28, speed * 0.016);

      p.dv += (stretch - p.def) * 0.16 * dt;
      p.dv *= Math.pow(0.8, dt);
      p.def += p.dv * dt;
      render();

      const moving =
        held ||
        speed > 0.03 ||
        Math.abs(goal.x - p.x) > 0.1 ||
        Math.abs(goal.y - p.y) > 0.1 ||
        Math.abs(goalS - p.s) > 0.002 ||
        Math.abs(p.vs) > 0.001 ||
        Math.abs(p.dv) > 0.0005;

      if (moving) {
        frame = requestAnimationFrame(step);
      } else {
        frame = 0;
        if (!hover) settle();
      }
    };
    const kick = () => {
      if (still) {
        if (held) {
          p.x = target.x;
          p.y = target.y;
          p.s = 1;
          render();
        } else settle();

        return;
      }
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(step);
      }
    };

    const aim = (e: PointerEvent) => {
      const w = wrap.getBoundingClientRect();

      // On touch, float the lens above the finger like iOS's loupe.
      target = { x: e.clientX - w.left, y: e.clientY - w.top - lift };
    };
    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      held = true;
      lift = e.pointerType === "touch" ? size * 0.85 : 0;
      setPulled(true);
      aim(e);
      kick();
    };
    const onMove = (e: PointerEvent) => {
      if (!held) return;
      aim(e);
      kick();
    };
    // Let go: the spring home starts from the lens's current velocity.
    const onUp = () => {
      if (!held) return;
      held = false;
      kick();
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      hover = true;
      kick();
    };
    const onLeave = () => {
      hover = false;
      kick();
    };

    relayout.current = () => {
      findHome();
      if (held || frame) return;
      p.x = home.x;
      p.y = home.y;
      if (!hover) p.s = home.s;
      render();
    };
    const onResize = () => relayout.current();

    handle.addEventListener("pointerdown", onDown);
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
    handle.addEventListener("pointerenter", onEnter);
    handle.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    document.fonts.ready.then(() => relayout.current());

    return () => {
      cancelAnimationFrame(frame);
      unlight();
      relayout.current = () => {};
      handle.removeEventListener("pointerdown", onDown);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      handle.removeEventListener("pointerenter", onEnter);
      handle.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative -mx-1 px-1 py-1">
      <Title />
      <div
        ref={orbRef}
        aria-hidden
        data-droplet
        className="lg pointer-events-none absolute top-0 left-0 z-10 size-[76px] rounded-full opacity-0 shadow-[0_14px_28px_-14px_rgb(0_0_0/0.4),0_2px_6px_-2px_rgb(0_0_0/0.18)] transition-opacity duration-700 [--lg-blur:0px] [backdrop-filter:none] [background:transparent] sm:size-[96px]"
      >
        {map && (
          <GlassFilter
            blur={0.2}
            chroma={0.025}
            id={FILTER_ID}
            map={map}
            saturate={1.05}
          />
        )}
        <div
          className="absolute inset-0 overflow-hidden rounded-full bg-[#fbf9f9] dark:bg-[#161b22]"
          style={{ filter: map ? `url(#${FILTER_ID})` : undefined }}
        >
          <div
            ref={cloneRef}
            className="absolute top-1 left-1 w-max origin-top-left"
            data-clone
          >
            <Title clone />
          </div>
        </div>
        {/* Bubble shading: rim thickness, a glossy specular highlight, and a soft caustic. */}
        <span className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgb(255_255_255/0.35),inset_0_12px_18px_-12px_rgb(255_255_255/0.75),inset_0_-14px_22px_-14px_rgb(255_255_255/0.5),inset_0_0_10px_rgb(0_0_0/0.05)]" />
        <span className="pointer-events-none absolute top-[9%] left-[19%] h-[22%] w-[44%] -rotate-[22deg] rounded-[50%] bg-[radial-gradient(closest-side,rgb(255_255_255/0.9),rgb(255_255_255/0))] opacity-75 mix-blend-screen" />
        <span className="pointer-events-none absolute right-[17%] bottom-[11%] h-[11%] w-[24%] -rotate-[22deg] rounded-[50%] bg-[radial-gradient(closest-side,rgb(255_255_255/0.55),transparent)] opacity-60" />
      </div>
      {/* A generous grab target around the period (the bead itself is tiny). */}
      <span
        ref={handleRef}
        aria-hidden
        className="absolute top-0 left-0 z-20 -mt-6 -ml-6 size-12 cursor-grab touch-none rounded-full active:cursor-grabbing"
        data-cursor="Pull the period"
        data-nodrag
      />
      <p
        aria-hidden
        className={cn(
          "pointer-events-none mt-3 text-[13px] text-muted transition-opacity duration-500 max-sm:hidden",
          pulled && "opacity-0",
        )}
      >
        Psst, the period is liquid glass. Pull it.
      </p>
    </div>
  );
}
