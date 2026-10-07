"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Eyebrow, TextLink } from "./ui";

import buy from "@/assets/packbook/buy.webp";
import identify from "@/assets/packbook/identify.webp";
import pack from "@/assets/packbook/pack.webp";
import share from "@/assets/packbook/share.webp";
import wall from "@/assets/packbook/wall.webp";
import { projects } from "@/config/site";
import { cn } from "@/lib/utils";

const SCREENS = [
  {
    src: wall,
    label: "Snap",
    alt: "PackBook gear wall with die-cut gear photos",
  },
  {
    src: identify,
    label: "Identify",
    alt: "PackBook identifying a Petzl GRIGRI",
  },
  {
    src: pack,
    label: "Pack",
    alt: "PackBook packing list with base weight by category",
  },
  { src: share, label: "Share", alt: "PackBook share card for a trip" },
  {
    src: buy,
    label: "Shop",
    alt: "PackBook gear detail with where-to-buy prices",
  },
];

export function PackBookCard() {
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [loaded, setLoaded] = useState(1);
  const rootRef = useRef<HTMLDivElement>(null);

  const go = (i: number) => {
    setLoaded((n) => Math.max(n, i + 2));
    setIndex(i);
  };

  // Flip through the app while the card is hovered.
  useEffect(() => {
    if (!hovering) return;
    const id = window.setInterval(
      () =>
        setIndex((i) => {
          const next = (i + 1) % SCREENS.length;

          setLoaded((n) => Math.max(n, next + 2));

          return next;
        }),
      1800,
    );

    return () => window.clearInterval(id);
  }, [hovering]);

  return (
    <div
      ref={rootRef}
      className="flex h-full gap-4 p-5 max-sm:flex-row sm:flex-col sm:p-6"
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") {
          setLoaded((n) => Math.max(n, 3));
          setHovering(true);
        }
      }}
      onPointerLeave={() => setHovering(false)}
    >
      <div className="flex min-w-0 flex-col max-sm:flex-1 max-sm:justify-between">
        <div>
          <Eyebrow>Side project · iOS</Eyebrow>
          <h2 className="title mt-1 text-[24px]">PackBook</h2>
          <p className="mt-1.5 text-[15px] leading-snug text-muted">
            Snap your gear. Pack it. Share it.
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-1 sm:hidden">
          {SCREENS.map((s, i) => (
            <button
              key={s.label}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                i === index
                  ? "border-glacier text-ink"
                  : "border-line text-muted",
              )}
              type="button"
              onClick={() => go(i)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <TextLink className="mt-3 sm:hidden" href={projects.packbook.href}>
          {projects.packbook.linkLabel}
        </TextLink>
      </div>

      <button
        aria-label="Next PackBook screen"
        className="relative mx-auto aspect-[720/1564] h-full max-h-full min-h-0 shrink-0 rounded-[1.6rem] bg-[#0b0b0c] p-[5px] shadow-[0_24px_48px_-24px_rgb(0_0_0/0.6)] transition-transform duration-500 ease-out [transform:perspective(900px)_rotateY(calc(var(--tx,0)*-12deg))_rotateX(calc(var(--ty,0)*8deg))] sm:min-h-0 sm:flex-1"
        data-cursor="Next screen"
        type="button"
        onClick={() => go((index + 1) % SCREENS.length)}
      >
        <span className="relative block size-full overflow-hidden rounded-[1.25rem] bg-[#f4f0e8]">
          {SCREENS.slice(0, loaded).map((s, i) => (
            <Image
              key={s.label}
              fill
              alt={s.alt}
              className={cn(
                "object-cover object-top transition-[opacity,scale] duration-500",
                i === index
                  ? "scale-100 opacity-100"
                  : "scale-[1.04] opacity-0",
              )}
              sizes="(max-width: 640px) 160px, 220px"
              src={s.src}
            />
          ))}
        </span>
      </button>

      <div className="hidden items-center justify-between sm:flex">
        <div className="-ml-[9px] flex">
          {SCREENS.map((s, i) => (
            <button
              key={s.label}
              aria-label={`Show ${s.label}`}
              className="group/dot grid size-6 place-items-center"
              type="button"
              onClick={() => go(i)}
            >
              <span
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === index
                    ? "w-4 bg-glacier"
                    : "w-1.5 bg-line-strong group-hover/dot:bg-muted",
                )}
              />
            </button>
          ))}
        </div>
        <TextLink href={projects.packbook.href}>
          {projects.packbook.linkLabel}
        </TextLink>
      </div>
    </div>
  );
}
