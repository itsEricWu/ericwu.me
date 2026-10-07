"use client";

import { useSyncExternalStore } from "react";

const noSubscribe = () => () => {};
const platformShortcut = () =>
  /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
    ? "⌘K"
    : "Ctrl K";

/** The command palette's shortcut as this platform writes it (⌘K until hydrated). */
export const useShortcut = () =>
  useSyncExternalStore(noSubscribe, platformShortcut, () => "⌘K");

/** The same label, for server-rendered places like the footer. */
export function Shortcut() {
  return useShortcut();
}
