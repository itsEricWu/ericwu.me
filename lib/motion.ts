/**
 * The site's motion language: three springs, and everything that moves uses
 * one of them. The same curves exist as CSS custom properties
 * (`--ease-snap`, `--ease-glide`, `--ease-wobble` in styles/globals.css) so
 * plain CSS transitions and script animations feel identical.
 *
 * - snap: feedback (presses, hovers, toggles). Quick and exact.
 * - glide: layout (cards moving to new slots, drops, sheets). Smooth, with a
 *   hair of overshoot.
 * - wobble: liquid things (the nav droplet, glass beads). Visible, playful
 *   overshoot, like a drop of water settling.
 */
export const SPRINGS = {
  snap: [520, 42],
  glide: [240, 25],
  wobble: [300, 17],
} as const;

/**
 * Builds a CSS `linear()` easing that follows a damped spring, so plain CSS
 * transitions and WAAPI animations get physical motion.
 */
export function springEasing(
  stiffness = 170,
  damping = 18,
  mass = 1,
  steps = 48,
) {
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const wd = w0 * Math.sqrt(Math.max(0, 1 - zeta * zeta));
  const duration = settleTime(w0, zeta);
  const points: string[] = [];

  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * duration;
    let x: number;

    if (zeta < 1) {
      x =
        1 -
        Math.exp(-zeta * w0 * t) *
          (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
    } else {
      x = 1 - Math.exp(-w0 * t) * (1 + w0 * t);
    }
    points.push(x.toFixed(4));
  }
  // End exactly at rest so nothing jumps on the last frame.
  points.push("1");

  return {
    easing: `linear(${points.join(", ")})`,
    duration: Math.round(duration * 1000),
  };
}

function settleTime(w0: number, zeta: number) {
  // Time for the envelope to fall under 0.1% of the initial displacement.
  return Math.min(2, Math.max(0.35, Math.log(1000) / (zeta * w0)));
}

const fallback = "cubic-bezier(0.2, 0.9, 0.25, 1)";

let supportsLinear: boolean | undefined;

export function spring(stiffness?: number, damping?: number) {
  if (supportsLinear === undefined) {
    supportsLinear =
      typeof CSS !== "undefined" &&
      CSS.supports("animation-timing-function", "linear(0, 1)");
  }
  const s = springEasing(stiffness, damping);

  return supportsLinear ? s : { easing: fallback, duration: s.duration };
}

/** Easing and duration for one of the site's springs, ready for `el.animate()`. */
export const springs = {
  snap: () => spring(...SPRINGS.snap),
  glide: () => spring(...SPRINGS.glide),
  wobble: () => spring(...SPRINGS.wobble),
};
