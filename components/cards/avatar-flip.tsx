"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";

import { cn, onIdle } from "@/lib/utils";

/**
 * Each face is hidden outright while it's turned away, switching as the flip
 * passes edge-on (114 ms into the spring below). backface-visibility alone isn't
 * enough: the theme switch's snapshot ignores it, which showed Bert.
 */
const face = (shown: boolean): CSSProperties => ({
  visibility: shown ? "visible" : "hidden",
  transition: "visibility 0s linear 114ms",
});

/** Tap the avatar to flip it over and meet Bert. */
export function AvatarFlip({
  avatarUrl,
  dogUrl,
}: {
  avatarUrl: string;
  dogUrl: string;
}) {
  const [flipped, setFlipped] = useState(false);
  const [showDog, setShowDog] = useState(false);

  useEffect(() => {
    const meet = () => {
      setShowDog(true);
      setFlipped(true);
    };
    const cancelIdle = onIdle(() => setShowDog(true), 5000);

    window.addEventListener("eric:bert", meet);

    return () => {
      window.removeEventListener("eric:bert", meet);
      cancelIdle();
    };
  }, []);

  return (
    <button
      aria-label={flipped ? "Show Eric again" : "Flip to meet Bert, my dog"}
      aria-pressed={flipped}
      className="group relative size-14 shrink-0 rounded-full [perspective:700px] sm:size-[60px]"
      data-cursor={flipped ? "Back to Eric" : "Meet Bert"}
      type="button"
      onClick={() => {
        setShowDog(true);
        setFlipped((f) => !f);
      }}
      onPointerEnter={() => setShowDog(true)}
    >
      <span
        className="relative block size-full transition-transform duration-[900ms] [transform-style:preserve-3d] [transition-timing-function:cubic-bezier(.3,1.35,.45,1)] group-active:scale-95"
        style={{ transform: flipped ? "rotateY(180deg)" : undefined }}
      >
        <span
          className="absolute inset-0 overflow-hidden rounded-full shadow-[0_8px_24px_-10px_rgb(0_0_0/0.45)] ring-1 ring-line [backface-visibility:hidden]"
          style={face(!flipped)}
        >
          <Image
            fill
            preload
            alt="Eric Wu"
            className="object-cover"
            sizes="60px"
            src={avatarUrl}
          />
        </span>
        <span
          className="absolute inset-0 overflow-hidden rounded-full bg-card-2 ring-1 ring-line [backface-visibility:hidden] [transform:rotateY(180deg)]"
          style={face(flipped)}
        >
          {showDog && (
            <Image
              fill
              alt="Bert, Eric's dog"
              className="object-cover"
              sizes="60px"
              src={dogUrl}
            />
          )}
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          "lg absolute -right-1 -bottom-0.5 grid size-6 place-items-center rounded-full text-[11px] transition-transform duration-500 group-hover:rotate-12",
        )}
      >
        <span className="lg-caustic" />
        <span>{flipped ? "👋" : "🐶"}</span>
      </span>
    </button>
  );
}
