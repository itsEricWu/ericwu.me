"use client";

import { useEffect } from "react";

/** How long a tab has to be away before it asks whether it is out of date. */
const AWAY = 60_000;

/**
 * Reloads a tab that comes back after a new deploy, so a page left open on a
 * phone for days never shows bugs that have since been fixed. It reloads at
 * most once per build.
 */
export function UpdateOnReturn() {
  useEffect(() => {
    let hiddenAt = 0;
    const check = async () => {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        const { build } = (await res.json()) as { build?: string };

        if (!build || build === process.env.SITE_BUILD) return;
        if (sessionStorage.getItem("reloaded-for") === build) return;
        sessionStorage.setItem("reloaded-for", build);
        location.reload();
      } catch {}
    };
    const onVisibility = () => {
      if (document.hidden) hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > AWAY) check();
    };
    // Restored from the back/forward cache: as good as a tab coming back.
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) check();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onShow);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onShow);
    };
  }, []);

  return null;
}
