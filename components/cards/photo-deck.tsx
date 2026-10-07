"use client";

import Image from "next/image";
import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const DEPTH = 4;

const tilt = (n: number) => (((n * 9301 + 49297) % 233280) / 233280 - 0.5) * 9;

/** A deck of photos: hover to fan, fling the top one away, or step through. */
export function PhotoDeck({ photos }: { photos: string[] }) {
  const [order, setOrder] = useState(() => photos.map((_, i) => i));
  const [seen, setSeen] = useState(0);
  const [fanned, setFanned] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    dx: number;
    dy: number;
    t: number;
    v: number;
  } | null>(null);
  const busy = useRef(false);

  const cycle = (dir: 1 | -1) =>
    setOrder((o) =>
      dir === 1 ? [...o.slice(1), o[0]] : [o[o.length - 1], ...o.slice(0, -1)],
    );

  const flyOut = (dx: number, dy: number) => {
    const el = topRef.current;

    if (!el || busy.current) return;
    busy.current = true;
    const len = Math.hypot(dx, dy) || 1;
    const tx = (dx / len) * 520;
    const ty = (dy / len) * 520;
    const anim = el.animate(
      [
        { transform: el.style.transform || "none", opacity: 1 },
        {
          transform: `translate(${tx}px, ${ty}px) rotate(${dx > 0 ? 24 : -24}deg)`,
          opacity: 0,
        },
      ],
      { duration: 380, easing: "cubic-bezier(.4,0,.8,.4)", fill: "forwards" },
    );

    anim.onfinish = () => {
      el.style.transform = "";
      anim.cancel();
      cycle(1);
      setSeen((s) => s + 1);
      busy.current = false;
    };
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (busy.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      dx: 0,
      dy: 0,
      t: e.timeStamp,
      v: 0,
    };
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;

    if (!d || !topRef.current) return;
    const now = e.timeStamp;
    const ndx = e.clientX - d.x;
    const ndy = e.clientY - d.y;

    d.v = Math.hypot(ndx - d.dx, ndy - d.dy) / Math.max(1, now - d.t);
    d.dx = ndx;
    d.dy = ndy;
    d.t = now;
    topRef.current.style.transform = `translate(${ndx}px, ${ndy}px) rotate(${ndx * 0.06}deg)`;
  };
  const onUp = () => {
    const d = drag.current;
    const el = topRef.current;

    drag.current = null;
    if (!d || !el) return;
    if (Math.hypot(d.dx, d.dy) > 90 || d.v > 0.8) {
      flyOut(d.dx || 1, d.dy);

      return;
    }
    if (Math.hypot(d.dx, d.dy) < 4) {
      flyOut(-1, -0.35);

      return;
    }
    const from = el.style.transform;
    const s = spring(260, 18);

    el.style.transform = "";
    el.animate([{ transform: from }, { transform: "none" }], {
      duration: s.duration,
      easing: s.easing,
    });
  };

  if (!photos.length) return null;
  const current = (seen % photos.length) + 1;

  return (
    <div
      className="relative h-full"
      onPointerEnter={(e) => e.pointerType !== "touch" && setFanned(true)}
      onPointerLeave={() => setFanned(false)}
    >
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-5">
        <p className="text-[15px] font-semibold">Field notes</p>
        <span className="text-[13px] text-muted tabular-nums">
          {current} of {photos.length}
        </span>
      </div>

      <div
        className="absolute inset-0 grid place-items-center pt-6"
        data-nodrag
      >
        {order
          .slice(0, DEPTH)
          .map((photo, i) => ({ photo, i }))
          .reverse()
          .map(({ photo, i }) => {
            const top = i === 0;
            const spread = fanned ? (i - 1.2) * 7 : tilt(photo);

            return (
              <div
                key={photo}
                className={cn(
                  "col-start-1 row-start-1 w-[80%] max-w-[500px] overflow-hidden rounded-2xl bg-card-2 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.55)] ring-1 ring-black/5 transition-[translate,rotate,scale] duration-500 ease-[cubic-bezier(.3,1.3,.5,1)] select-none",
                  top
                    ? "cursor-grab touch-none active:cursor-grabbing"
                    : "pointer-events-none",
                )}
                style={{
                  zIndex: 10 - i,
                  translate: fanned
                    ? `${i * 26}px ${-i * 6}px`
                    : `${i * 5}px ${-i * 9}px`,
                  rotate: `${spread}deg`,
                  scale: String(1 - i * 0.035),
                }}
              >
                <div
                  ref={top ? topRef : undefined}
                  className="relative aspect-video w-full"
                  data-cursor={top ? "Fling or tap" : undefined}
                  onPointerCancel={top ? onUp : undefined}
                  onPointerDown={top ? onDown : undefined}
                  onPointerMove={top ? onMove : undefined}
                  onPointerUp={top ? onUp : undefined}
                >
                  <Image
                    fill
                    alt="A photo from Eric's camera roll"
                    className="pointer-events-none object-cover"
                    draggable={false}
                    sizes="(max-width: 640px) 80vw, 480px"
                    src={photos[photo]}
                  />
                </div>
              </div>
            );
          })}
      </div>

      <div className="absolute right-4 bottom-4 z-20 flex gap-2">
        {([-1, 1] as const).map((dir) => (
          <button
            key={dir}
            aria-label={dir === 1 ? "Next photo" : "Previous photo"}
            className="lg grid size-9 place-items-center rounded-full transition-[scale] hover:scale-105 active:scale-95"
            type="button"
            onClick={() => {
              if (dir === 1) flyOut(-1, -0.35);
              else {
                cycle(-1);
                setSeen((s) => (s - 1 + photos.length) % photos.length);
              }
            }}
          >
            <span className="lg-caustic" />
            <svg
              aria-hidden
              className={cn("size-4", dir === -1 && "rotate-180")}
              fill="none"
              viewBox="0 0 16 16"
            >
              <path
                d="M6 3.5 10.5 8 6 12.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
