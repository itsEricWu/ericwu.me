"use client";

import { useEffect } from "react";

import { onIdle } from "@/lib/utils";

/**
 * Brings in the display face after the first paint, so it never holds up the
 * first frame. Until then headings use a fallback with matching metrics, so
 * nothing shifts when it swaps in. Returning visitors already have the font
 * cached; an inline script in <head> switches it on before their first paint.
 */
export function FontLoader({ faces }: { faces: string[] }) {
  useEffect(() => {
    const root = document.documentElement;

    if (root.classList.contains("ff")) return;
    let live = true;
    const cancel = onIdle(() => {
      Promise.all(faces.map((face) => document.fonts.load(face)))
        .then(() => {
          if (!live) return;
          root.classList.add("ff", "ff-in");
          try {
            localStorage.setItem("ff", "1");
          } catch {}
        })
        .catch(() => {});
    }, 800);

    return () => {
      live = false;
      cancel();
    };
  }, [faces]);

  return null;
}
