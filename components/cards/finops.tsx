"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Eyebrow, SampleNote, TextLink } from "./ui";

import { projects } from "@/config/site";
import { springs } from "@/lib/motion";
import { cn, prefersReducedMotion } from "@/lib/utils";

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

/**
 * FinOps Agent, told the way it shows up for an engineer: as notifications.
 * They move the way iOS notifications do: a new one drops in at the top on a
 * spring while the ones below glide down to make room, and a replay clears
 * the stack before it runs again.
 */
export function FinOpsCard() {
  const [shown, setShown] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const timers = useRef<number[]>([]);
  const run = useRef(0);
  // Where each notification sat on screen just before the list last changed.
  const from = useRef(new Map<string, number>());

  const rows = useCallback(
    () => [...(listRef.current?.children ?? [])] as HTMLElement[],
    [],
  );

  /** Shows the first `n` notifications, noting where the current ones are. */
  const show = useCallback(
    (n: number) => {
      from.current = new Map(
        rows().map((li) => [li.dataset.note!, li.getBoundingClientRect().top]),
      );
      setShown(n);
    },
    [rows],
  );

  const play = useCallback(() => {
    const id = ++run.current;
    const start = () => {
      if (id !== run.current) return;
      show(0);
      timers.current = NOTES.map((_, i) =>
        window.setTimeout(() => show(i + 1), 500 + i * 1000),
      );
    };
    const current = rows();

    timers.current.forEach(window.clearTimeout);
    if (!current.length || prefersReducedMotion()) return start();
    // Clear the stack first, as iOS does: a quick fade and shrink, top first.
    Promise.all(
      current.map((li, i) => {
        const out = li.animate(
          [
            { opacity: 1, transform: "none" },
            { opacity: 0, transform: "translateY(-6px) scale(0.96)" },
          ],
          {
            duration: 200,
            delay: i * 40,
            easing: "cubic-bezier(0.4, 0, 1, 1)",
            fill: "forwards",
          },
        );

        out.id = "note";

        return out.finished;
      }),
    ).then(start, start);
  }, [rows, show]);

  // The stack moves down a slot as one: the ones already up glide from where
  // they were (FLIP) while the new one slides in from above the top edge, all
  // on the same spring, so the gaps between them never change.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const glide = springs.glide();
    const list = listRef.current;
    const gap = list ? parseFloat(getComputedStyle(list).rowGap) || 0 : 0;

    rows().forEach((li) => {
      const before = from.current.get(li.dataset.note!);

      li.getAnimations().forEach((a) => a.id === "note" && a.cancel());
      const moves =
        before === undefined
          ? [
              li.animate(
                [
                  {
                    transform: `translateY(${-(li.offsetHeight + gap)}px) scale(0.94)`,
                  },
                  { transform: "none" },
                ],
                glide,
              ),
              li.animate([{ opacity: 0 }, { opacity: 1 }], {
                duration: 320,
                easing: "cubic-bezier(0.2, 0, 0, 1)",
              }),
            ]
          : [
              li.animate(
                [
                  {
                    transform: `translateY(${before - li.getBoundingClientRect().top}px)`,
                  },
                  { transform: "none" },
                ],
                glide,
              ),
            ];

      moves.forEach((a) => (a.id = "note"));
    });
    from.current.clear();
  }, [rows, shown]);

  useEffect(() => {
    const el = rootRef.current;
    const runs = run;
    const pending = timers;

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
      runs.current++;
      pending.current.forEach(window.clearTimeout);
    };
  }, [play]);

  return (
    <div className="flex h-full flex-col gap-4 p-5 sm:flex-row sm:gap-5 sm:p-6">
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

      {/* The panel sits closer to the card's edge than the text (10px, 12px from
          640px) with its corners concentric with the card's (24 - 10, 28 - 12). */}
      <div
        ref={rootRef}
        className="relative -mx-2.5 -mb-2.5 min-h-0 flex-1 cursor-pointer overflow-hidden rounded-[14px] [container-type:size] bg-gradient-to-b from-inset to-[color-mix(in_oklab,var(--blush)_34%,var(--card-inset))] ring-1 ring-line ring-inset sm:mx-0 sm:-my-3 sm:-mr-3 sm:rounded-[16px] dark:to-[color-mix(in_oklab,var(--ember)_12%,var(--card-inset))]"
        data-cursor="Replay"
        data-nodrag
        role="button"
        tabIndex={0}
        onClick={play}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && play()}
      >
        {/* The chart sits below the notifications: three when the panel is
            tall enough, else two (46px each, 6px apart, from 10px down). */}
        <div className="absolute inset-x-0 top-[168px] bottom-0 [@container(height<220px)]:top-[116px]">
          <svg
            aria-label="Daily cost over 30 days with a spike on day 23"
            className="absolute inset-0 size-full"
            preserveAspectRatio="none"
            role="img"
            viewBox={`0 0 ${W} ${H}`}
          >
            <defs>
              <linearGradient id="finops-area" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="0"
                  stopColor="var(--glacier)"
                  stopOpacity="0.28"
                />
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
              top: `${(y(DAYS[SPIKE]) / H) * 100}%`,
            }}
          >
            <span className="absolute inset-0 animate-ping-soft rounded-full bg-ember" />
            <span className="absolute inset-0 rounded-full bg-ember ring-2 ring-card" />
          </span>
        </div>

        <ol
          ref={listRef}
          aria-live="polite"
          className="absolute inset-x-2.5 top-2.5 flex flex-col gap-1.5"
        >
          {NOTES.slice(0, shown)
            .map((n, i) => ({ ...n, i }))
            .reverse()
            .map((n, k) => (
              <li
                key={n.title}
                className={cn(
                  "lg flex h-[46px] items-start gap-2.5 rounded-[16px] px-3 py-2 transition-[opacity,scale] duration-300 ease-out [--glass-tint:color-mix(in_oklab,var(--card)_60%,transparent)] [--lg-blur:14px] dark:[--glass-tint:color-mix(in_oklab,var(--card)_45%,transparent)]",
                  // Where only two fit, the oldest fades as it's pushed down.
                  k > 1 &&
                    "[@container(height<220px)]:scale-95 [@container(height<220px)]:opacity-0",
                )}
                data-note={n.title}
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
