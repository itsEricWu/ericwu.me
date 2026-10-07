"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { cn } from "@/lib/utils";

type Result = { url: string; name: string };

/** Type a feeling, get an animated emoji (OpenAI picks it, server-side). */
export function EmojiCard() {
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [animate, setAnimate] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const rootRef = useRef<HTMLFormElement>(null);

  // Swap the still frame for the animated wave once the card has been on screen a moment.
  useEffect(() => {
    const el = rootRef.current;

    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearTimeout(timer);
      if (e.isIntersecting)
        timer = window.setTimeout(() => setAnimate(true), 1200);
    });

    io.observe(el);

    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const prompt = text.trim() || "hello";

    setState("loading");
    setLoaded(false);
    try {
      const res = await fetch("/api/emoji", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = (await res.json()) as Partial<Result>;

      if (!res.ok || !data.url) throw new Error("no emoji");
      setResult({ url: data.url, name: data.name ?? "emoji" });
      setState("idle");
    } catch {
      setState("error");
    }
  };

  return (
    <form
      ref={rootRef}
      className="flex h-full flex-col gap-2 p-3 sm:gap-3 sm:p-6"
      onSubmit={submit}
    >
      <div className="relative grid min-h-0 flex-1 place-items-center">
        <span className="absolute inset-[12%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--ember)_22%,transparent),transparent)]" />
        {state === "loading" ? (
          <span className="size-16 animate-shimmer sm:size-[88px] rounded-full bg-[linear-gradient(90deg,var(--card-2),color-mix(in_oklab,var(--glacier)_20%,transparent),var(--card-2))] bg-[length:200%_100%]" />
        ) : result ? (
          // eslint-disable-next-line @next/next/no-img-element -- animated APNG, can't be optimized
          <img
            key={result.url}
            alt={result.name}
            className={cn(
              "relative size-16 transition-[opacity,scale] duration-500 ease-[cubic-bezier(.3,1.5,.5,1)] sm:size-[104px]",
              loaded ? "scale-100 opacity-100" : "scale-50 opacity-0",
            )}
            height={104}
            src={result.url}
            width={104}
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <picture className="relative">
            {animate && <source srcSet="/emoji/wave.avif" type="image/avif" />}
            <img
              alt="Waving hand"
              className="size-16 sm:size-[104px]"
              height={104}
              src={animate ? "/emoji/wave.webp" : "/emoji/wave-poster.webp"}
              width={104}
            />
          </picture>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-[13px] font-semibold text-muted max-sm:hidden">
          Text to emoji
        </p>
        <div className="flex items-center gap-1 rounded-full border border-line bg-card-2/60 p-0.5 pl-2.5 focus-within:border-glacier sm:gap-1.5 sm:p-1 sm:pl-3">
          <input
            aria-label="Describe a mood"
            className="min-w-0 flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-muted sm:text-[13.5px]"
            maxLength={80}
            placeholder={state === "error" ? "Try again?" : "Summit day!"}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="h-7 rounded-full bg-ink px-2.5 text-[12px] font-semibold text-bg transition-transform hover:scale-[1.04] active:scale-95 disabled:opacity-60 sm:h-8 sm:px-3"
            data-cursor="Generate"
            disabled={state === "loading"}
            type="submit"
          >
            Go
          </button>
        </div>
      </div>
    </form>
  );
}
