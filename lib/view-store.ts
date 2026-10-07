"use client";

import { useSyncExternalStore } from "react";

export const VIEWS = ["all", "about", "work"] as const;
export type View = (typeof VIEWS)[number];

type Listener = () => void;

let current: View = "all";
const listeners = new Set<Listener>();
const beforeChange = new Set<Listener>();

export const isView = (value: string): value is View =>
  (VIEWS as readonly string[]).includes(value);

/** The view a URL hash asks for. Work and projects were once two views; old #projects links land on Work. */
export const viewFromHash = (hash: string): View =>
  hash === "projects" ? "work" : isView(hash) ? hash : "all";

export function getView() {
  return current;
}

/** Switch the home grid's view. `beforeChange` listeners run first so the grid can measure for FLIP. */
export function setView(next: View, { updateUrl = true } = {}) {
  if (next === current) return;
  beforeChange.forEach((fn) => fn());
  current = next;
  if (updateUrl && typeof window !== "undefined") {
    const url = next === "all" ? window.location.pathname : `#${next}`;

    window.history.replaceState(window.history.state, "", url);
  }
  listeners.forEach((fn) => fn());
}

export function onBeforeViewChange(fn: Listener) {
  beforeChange.add(fn);

  return () => {
    beforeChange.delete(fn);
  };
}

function subscribe(fn: Listener) {
  listeners.add(fn);

  return () => {
    listeners.delete(fn);
  };
}

export function useView() {
  return useSyncExternalStore(subscribe, getView, () => "all" as View);
}
