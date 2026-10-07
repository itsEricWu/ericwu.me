"use client";

import Image from "next/image";
import { useState } from "react";

// Hosts the image optimizer may fetch: images.remotePatterns in next.config.js.
const OPTIMIZED = new Set([
  "www.notion.so",
  "upload.wikimedia.org",
  "images.unsplash.com",
]);

const optimizable = (src: string) => {
  try {
    return OPTIMIZED.has(new URL(src).hostname);
  } catch {
    return false;
  }
};

/**
 * A post's cover. If the optimizer can't fetch it, the browser asks the
 * source itself; if that fails too, a quiet aurora wash stands in.
 */
export function Cover({
  src,
  title,
  index,
}: {
  src: string | undefined;
  title: string;
  index: number;
}) {
  // 0: optimized, 1: straight from the source, 2: gave up.
  const [attempt, setAttempt] = useState(() =>
    !src ? 2 : optimizable(src) ? 0 : 1,
  );

  if (!src || attempt > 1) {
    return (
      <div
        aria-hidden
        className="absolute inset-0 grid place-items-center bg-[radial-gradient(90%_120%_at_12%_0%,var(--aurora-a),transparent_62%),radial-gradient(80%_110%_at_100%_100%,var(--aurora-b),transparent_58%)]"
      >
        <span className="font-display text-[64px] leading-none text-ink/15 italic">
          {title.trim().charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <Image
      fill
      alt=""
      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      loading={index < 3 ? "eager" : "lazy"}
      preload={index === 0}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 340px"
      src={src}
      unoptimized={attempt === 1}
      onError={() => setAttempt((a) => a + 1)}
    />
  );
}
