"use client";

import { useEffect, useRef, useState } from "react";

import { Eyebrow, SampleNote, TextLink } from "./ui";

import { projects } from "@/config/site";
import { cn } from "@/lib/utils";

// 30 days of daily spend with one anomaly (sample data).
const DAYS = [
  3.1, 3.2, 3.0, 3.3, 3.2, 3.4, 3.3, 3.1, 3.2, 3.5, 3.4, 3.3, 3.2, 3.4, 3.6,
  3.5, 3.4, 3.5, 3.6, 3.5, 3.4, 3.6, 5.0, 4.9, 4.8, 3.7, 3.6, 3.5, 3.6, 3.5,
];
const SPIKE = 22;

const NOTES = [
  {
    title: "Anomaly detected",
    body: "EC2 spend is up 38% today in us-east-1.",
  },
  {
    title: "Root cause found",
    body: "CI fleet stuck at max: 24 new g5.2xlarge.",
  },
  { title: "Ticket filed", body: "COST-142 opened and posted to #team-cost." },
];

const W = 300;
const H = 100;
const x = (i: number) => (i / (DAYS.length - 1)) * W;
const y = (v: number) => H - 6 - (v / 5.4) * (H - 24);
const PATH = DAYS.map(
  (v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`,
).join(" ");

/** FinOps Agent, told the way it shows up for an engineer: as notifications. */
export function FinOpsCard() {
  const [shown, setShown] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const play = () => {
    timers.current.forEach(window.clearTimeout);
    setShown(0);
    timers.current = NOTES.map((_, i) =>
      window.setTimeout(() => setShown(i + 1), 450 + i * 900),
    );
  };

  useEffect(() => {
    const el = rootRef.current;

    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          play();
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );

    io.observe(el);

    return () => {
      io.disconnect();
      timers.current.forEach(window.clearTimeout);
    };
  }, []);

  return (
    <div className="flex h-full flex-col gap-4 p-5 sm:flex-row sm:gap-5 sm:p-6 lg:p-7">
      <div className="flex flex-col sm:w-[43%] sm:shrink-0">
        <Eyebrow accent>AWS · Public preview</Eyebrow>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <h2 className="title text-[26px] lg:text-[28px]">FinOps Agent</h2>
          <TextLink
            className="sm:hidden"
            href={projects.finops.href}
            label="See it on AWS: FinOps Agent"
          >
            See it on AWS
          </TextLink>
        </div>
        <p className="mt-2 text-[15px] leading-snug text-muted">
          Always-on cost expertise for every engineer, right where they work.
        </p>
        <div className="mt-auto pt-3 max-sm:hidden">
          <TextLink
            href={projects.finops.href}
            label="See it on AWS: FinOps Agent"
          >
            See it on AWS
          </TextLink>
        </div>
      </div>

      <div
        ref={rootRef}
        className="relative min-h-0 flex-1 cursor-pointer overflow-hidden rounded-[20px] bg-gradient-to-b from-inset to-[color-mix(in_oklab,var(--blush)_34%,var(--card-inset))] ring-1 ring-line ring-inset dark:to-[color-mix(in_oklab,var(--ember)_12%,var(--card-inset))]"
        data-cursor="Replay"
        data-nodrag
        role="button"
        tabIndex={0}
        onClick={play}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && play()}
      >
        <svg
          aria-label="Daily cost over 30 days with a spike on day 23"
          className="absolute inset-x-0 bottom-0 h-[52%] w-full"
          preserveAspectRatio="none"
          role="img"
          viewBox={`0 0 ${W} ${H}`}
        >
          <defs>
            <linearGradient id="finops-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--glacier)" stopOpacity="0.28" />
              <stop offset="1" stopColor="var(--glacier)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${PATH} L${W} ${H} L0 ${H} Z`} fill="url(#finops-area)" />
          <path
            d={PATH}
            fill="none"
            stroke="var(--glacier)"
            strokeLinejoin="round"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span
          aria-hidden
          className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${(x(SPIKE) / W) * 100}%`,
            top: `${48 + (y(DAYS[SPIKE]) / H) * 52}%`,
          }}
        >
          <span className="absolute inset-0 animate-ping-soft rounded-full bg-ember" />
          <span className="absolute inset-0 rounded-full bg-ember ring-2 ring-card" />
        </span>

        <ol
          className="absolute inset-x-2.5 top-2.5 flex flex-col gap-1.5"
          aria-live="polite"
        >
          {NOTES.slice(0, shown)
            .map((n, i) => ({ ...n, i }))
            .reverse()
            .map((n, k) => (
              <li
                key={n.title}
                className={cn(
                  "lg flex items-start gap-2.5 rounded-[16px] bg-card/60 px-3 py-2 [--lg-blur:14px] [animation:notify_.55s_cubic-bezier(.2,.9,.25,1.15)_both] dark:bg-card/45",
                  k > 1 && "max-sm:hidden",
                )}
              >
                <span className="lg-caustic" />
                <span className="mt-0.5 grid size-[22px] shrink-0 place-items-center rounded-[7px] bg-gradient-to-br from-ember to-[#f6a04d] text-[12px] font-bold text-white shadow-sm">
                  $
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[12.5px] font-semibold">
                      {n.title}
                    </span>
                    <span className="shrink-0 text-[10.5px] text-muted">
                      {k === 0 ? "now" : `${k}m ago`}
                    </span>
                  </span>
                  <span className="block truncate text-[12px] text-ink-2">
                    {n.body}
                  </span>
                </span>
              </li>
            ))}
        </ol>
        <SampleNote className="absolute right-3 bottom-2" />
      </div>
    </div>
  );
}
