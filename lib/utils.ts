import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const hasFinePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Run `cb` when the browser is idle (or soon, where idle callbacks aren't supported). */
export function onIdle(cb: () => void, timeout = 2000) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(cb, { timeout });

    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(cb, Math.min(timeout, 700));

  return () => clearTimeout(id);
}
