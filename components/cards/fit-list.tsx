"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A list that shows only the rows that fit its height, so a card never ends
 * on half a row or on a gap. Rows that don't fit are hidden outright, which
 * also takes their links out of the tab order.
 */
export function FitList({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = ref.current;

    if (!list) return;
    const fit = () => {
      const rows = [...list.children] as HTMLElement[];

      rows.forEach((row) => (row.hidden = false));
      const limit = list.clientHeight + 0.5;

      rows.forEach((row) => {
        row.hidden = row.offsetTop + row.offsetHeight > limit;
      });
    };
    const observer = new ResizeObserver(fit);

    fit();
    observer.observe(list);

    return () => observer.disconnect();
  }, []);

  return (
    <ul ref={ref} className={cn("relative overflow-hidden", className)}>
      {children}
    </ul>
  );
}
