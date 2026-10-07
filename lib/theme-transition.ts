"use client";

import { flushSync } from "react-dom";

import { isWebKit, prefersReducedMotion } from "@/lib/utils";

type ViewTransitionDoc = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> };
};

/**
 * WebKit (Safari, and every browser on iOS) paints view-transition snapshots
 * without backdrop blur, so the glass nav and cards turned clear for the
 * length of the reveal and flashed back. There the theme switches at once.
 */
const snapshotsDropGlass = isWebKit;

/**
 * Switches the theme with a circular reveal that grows from `origin`
 * (usually the button that was clicked). Falls back to an instant switch.
 */
export function switchTheme(
  next: "light" | "dark",
  setTheme: (theme: string) => void,
  origin?: { x: number; y: number },
) {
  const doc = document as ViewTransitionDoc;
  const apply = () => {
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    flushSync(() => setTheme(next));
  };

  if (
    !doc.startViewTransition ||
    prefersReducedMotion() ||
    snapshotsDropGlass()
  ) {
    apply();

    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const transition = doc.startViewTransition(apply);

  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {});
}
