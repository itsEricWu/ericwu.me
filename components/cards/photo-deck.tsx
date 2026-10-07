"use client";

import Image from "next/image";
import {
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { springs } from "@/lib/motion";
import { cn, prefersReducedMotion } from "@/lib/utils";

const DEPTH = 4;

const tilt = (n: number) => (((n * 9301 + 49297) % 233280) / 233280 - 0.5) * 9;

type Gesture = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  t: number;
  v: number;
};

/**
 * A deck of photos: hover to fan it, fling the top photo away (or tap it),
 * or step through with the buttons. Gestures move the whole card.
 */
export function PhotoDeck({ photos }: { photos: string[] }) {
  const [order, setOrder] = useState(() => photos.map((_, i) => i));
  const [seen, setSeen] = useState(0);
  const [fanned, setFanned] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const busy = useRef(false);
  /** Set when the next render should slide a photo back onto the top. */
  const returning = useRef(false);

  // A photo stepped back onto the deck glides in from the left.
  useLayoutEffect(() => {
    const el = topRef.current;

    if (!returning.current || !el) return;
    returning.current = false;
    if (prefersReducedMotion()) return;
    const s = springs.glide();

    el.animate(
      [
        { transform: "translate(-70%, -6%) rotate(-14deg)", opacity: 0 },
        { transform: "none", opacity: 1 },
      ],
      { duration: s.duration, easing: s.easing },
    );
  }, [order]);

  const next = () => {
    setOrder((o) => [...o.slice(1), o[0]]);
    setSeen((s) => s + 1);
  };

  const previous = () => {
    if (busy.current) return;
    returning.current = true;
    setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
    setSeen((s) => (s - 1 + photos.length) % photos.length);
  };

  /** Throw the top photo off the deck, then bring the next one up. */
  const flyOut = (dx: number, dy: number) => {
    const el = topRef.current;

    if (!el || busy.current) return;
    if (prefersReducedMotion()) {
      el.style.transform = "";
      next();

      return;
    }
    busy.current = true;
    const len = Math.hypot(dx, dy) || 1;
    const anim = el.animate(
      [
        { transform: el.style.transform || "none", opacity: 1 },
        {
          transform: `translate(${(dx / len) * 560}px, ${(dy / len) * 560}px) rotate(${dx > 0 ? 26 : -26}deg)`,
          opacity: 0,
        },
      ],
      {
        duration: 360,
        easing: "cubic-bezier(.45,0,.85,.4)",
        fill: "forwards",
      },
    );

    anim.onfinish = () => {
      // The thrown card leaves the visible deck with the reorder and unmounts,
      // so its end state holds until then: no flash back on top.
      el.style.transform = "";
      next();
      busy.current = false;
    };
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (busy.current || (e.pointerType === "mouse" && e.button !== 0)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = {
      x: e.clientX,
      y: e.clientY,
      dx: 0,
      dy: 0,
      t: e.timeStamp,
      v: 0,
    };
  };

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    const el = topRef.current;

    if (!g || !el) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;

    g.v = Math.hypot(dx - g.dx, dy - g.dy) / Math.max(1, e.timeStamp - g.t);
    g.dx = dx;
    g.dy = dy;
    g.t = e.timeStamp;
    el.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.05}deg)`;
  };

  const onUp = () => {
    const g = gesture.current;
    const el = topRef.current;

    gesture.current = null;
    if (!g || !el) return;
    const dist = Math.hypot(g.dx, g.dy);

    if (dist > 90 || g.v > 0.8) {
      flyOut(g.dx || 1, g.dy);

      return;
    }
    if (dist < 4) {
      flyOut(-1, -0.35);

      return;
    }
    // Not far enough: settle back onto the deck.
    const from = el.style.transform;

    el.style.transform = "";
    if (prefersReducedMotion()) return;
    const s = springs.wobble();

    el.animate([{ transform: from }, { transform: "none" }], {
      duration: s.duration,
      easing: s.easing,
    });
  };

  // The browser took the gesture (e.g. a vertical scroll): put the photo back.
  const onCancel = () => {
    gesture.current = null;
    if (topRef.current) topRef.current.style.transform = "";
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
        <p className="font-display text-[17px] font-semibold tracking-[-0.005em]">
          Field notes
        </p>
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
                ref={top ? topRef : undefined}
                className={cn(
                  "relative col-start-1 row-start-1 aspect-video w-[80%] max-w-[500px] overflow-hidden rounded-2xl bg-card-2 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.55)] ring-1 ring-black/5 select-none [transition:translate_var(--dur-glide)_var(--ease-glide),rotate_var(--dur-glide)_var(--ease-glide),scale_var(--dur-glide)_var(--ease-glide),opacity_.5s_ease] starting:opacity-0",
                  top
                    ? "cursor-grab touch-pan-y active:cursor-grabbing"
                    : "pointer-events-none",
                )}
                data-cursor={top ? "Fling or tap" : undefined}
                style={{
                  zIndex: 10 - i,
                  translate: fanned
                    ? `${i * 26}px ${-i * 6}px`
                    : `${i * 5}px ${-i * 9}px`,
                  rotate: `${spread}deg`,
                  scale: String(1 - i * 0.035),
                }}
                onPointerCancel={top ? onCancel : undefined}
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
            );
          })}
      </div>

      <div className="absolute right-4 bottom-4 z-20 flex gap-2">
        {([-1, 1] as const).map((dir) => (
          <button
            key={dir}
            aria-label={dir === 1 ? "Next photo" : "Previous photo"}
            className="lg grid size-9 place-items-center rounded-full"
            type="button"
            onClick={() => (dir === 1 ? flyOut(-1, -0.35) : previous())}
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
