"use client";

import { useEffect, useMemo, useState } from "react";

import { Eyebrow, SampleNote, TextLink } from "./ui";

import { projects } from "@/config/site";
import { cn } from "@/lib/utils";

const TABS = [
  {
    id: "chart",
    label: "Chart",
    prompt: "Chart my costs by region last month",
  },
  { id: "table", label: "Table", prompt: "List my running EC2 instances" },
  {
    id: "forecast",
    label: "Forecast",
    prompt: "Forecast my spend for 6 months",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

const REGIONS = [
  { name: "us-east-1", value: 4820 },
  { name: "us-west-2", value: 2310 },
  { name: "eu-west-1", value: 1540 },
  { name: "ap-ne-1", value: 960 },
  { name: "eu-c-1", value: 610 },
];

const INSTANCES = [
  { id: "i-0d3f42", type: "g5.xlarge", cpu: 88 },
  { id: "i-04be19", type: "c7i.xlarge", cpu: 71 },
  { id: "i-09c6a0", type: "r7g.2xlarge", cpu: 54 },
  { id: "i-0a71c3", type: "m7g.large", cpu: 38 },
  { id: "i-0f2d88", type: "t4g.medium", cpu: 12 },
];

const ACTUAL = [8.1, 8.6, 9.4, 9.1, 10.2, 10.9];
const FORECAST = [11.3, 11.9, 12.2, 12.9, 13.4, 14.1];

function RegionChart() {
  const [hover, setHover] = useState<number | null>(null);
  const max = REGIONS[0].value;

  return (
    <div className="flex h-full flex-col">
      <p className="mb-1.5 flex justify-between text-[11.5px] text-muted">
        <span className="font-medium text-ink">Cost by region</span>
        <span className="tabular-nums">
          {hover === null
            ? "$10,240"
            : `$${REGIONS[hover].value.toLocaleString()}`}
        </span>
      </p>
      <div
        className="flex min-h-0 flex-1 items-end gap-1.5"
        onPointerLeave={() => setHover(null)}
      >
        {REGIONS.map((r, i) => (
          <button
            key={r.name}
            aria-label={`${r.name}: $${r.value.toLocaleString()}`}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
            type="button"
            onFocus={() => setHover(i)}
            onPointerEnter={() => setHover(i)}
          >
            <span
              className={cn(
                "w-full origin-bottom rounded-[6px] transition-opacity duration-300 [animation:grow_.8s_cubic-bezier(.2,.9,.25,1.05)_both]",
                hover === null || hover === i ? "opacity-100" : "opacity-35",
              )}
              style={{
                height: `${(r.value / max) * 100}%`,
                animationDelay: `${i * 60}ms`,
                background:
                  "linear-gradient(180deg, var(--glacier), color-mix(in oklab, var(--glacier) 55%, var(--sky)))",
              }}
            />
            <span className="w-full truncate text-center text-[9.5px] text-muted">
              {r.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function InstanceTable() {
  const [dir, setDir] = useState<1 | -1>(-1);
  const rows = useMemo(
    () => [...INSTANCES].sort((a, b) => (a.cpu - b.cpu) * dir),
    [dir],
  );

  return (
    <div className="flex h-full flex-col text-[11.5px]">
      <div className="grid grid-cols-[1fr_1.2fr_1fr] border-b border-line pb-1 text-muted">
        <span>Instance</span>
        <span>Type</span>
        <button
          className="text-left hover:text-ink"
          type="button"
          onClick={() => setDir((d) => (d === 1 ? -1 : 1))}
        >
          CPU {dir === -1 ? "↓" : "↑"}
        </button>
      </div>
      {/* Rows that don't fit wrap into a hidden second column: only whole rows show. */}
      <ul className="flex min-h-0 flex-1 flex-col flex-wrap overflow-hidden">
        {rows.map((r, i) => (
          <li
            key={r.id}
            className="grid w-full grid-cols-[1fr_1.2fr_1fr] items-center border-b border-line/70 py-[5px] [animation:rise_.4s_ease_both]"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span className="font-mono text-[10.5px] text-glacier-ink">
              {r.id}
            </span>
            <span className="truncate">{r.type}</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                <span
                  className={cn(
                    "block h-full rounded-full",
                    r.cpu > 80 ? "bg-ember" : "bg-glacier",
                  )}
                  style={{ width: `${r.cpu}%` }}
                />
              </span>
              <span className="w-7 text-right tabular-nums text-muted">
                {r.cpu}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ForecastChart() {
  const all = [...ACTUAL, ...FORECAST];
  const px = (i: number) => (i / (all.length - 1)) * 300;
  const py = (v: number) => 92 - ((v - 7) / 8.5) * 84;
  const line = (pts: number[], offset = 0) =>
    pts
      .map(
        (v, i) =>
          `${i ? "L" : "M"}${px(i + offset).toFixed(1)} ${py(v).toFixed(1)}`,
      )
      .join(" ");
  const band = [
    ...FORECAST.map(
      (v, i) =>
        `${i ? "L" : "M"}${px(i + 6).toFixed(1)} ${py(v * (1 + 0.022 * (i + 1))).toFixed(1)}`,
    ),
    ...[...FORECAST]
      .reverse()
      .map(
        (v, j) =>
          `L${px(11 - j).toFixed(1)} ${py(v * (1 - 0.022 * (6 - j))).toFixed(1)}`,
      ),
    "Z",
  ].join(" ");

  return (
    <div className="flex h-full flex-col">
      <p className="mb-1 flex justify-between text-[11.5px] text-muted">
        <span className="font-medium text-ink">Monthly spend</span>
        <span>+29% by March</span>
      </p>
      <svg
        aria-label="Spend forecast"
        className="min-h-0 w-full flex-1"
        preserveAspectRatio="none"
        role="img"
        viewBox="0 0 300 96"
      >
        <path
          className="[animation:fade-in_.8s_.5s_ease_both]"
          d={band}
          fill="var(--ember)"
          fillOpacity="0.16"
        />
        <path
          className="[animation:draw_.9s_ease_both]"
          d={line(ACTUAL)}
          fill="none"
          pathLength={1}
          stroke="var(--glacier)"
          strokeDasharray="1 1"
          strokeLinecap="round"
          strokeWidth="2.4"
        />
        <path
          className="[animation:fade-in_.6s_.8s_ease_both]"
          d={line([ACTUAL[5], ...FORECAST], 5)}
          fill="none"
          stroke="var(--ember)"
          strokeDasharray="5 5"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/** Amazon Q artifacts: ask, and the answer arrives as interactive UI. */
export function ArtifactsCard() {
  const [active, setActive] = useState<TabId>("chart");
  const [busy, setBusy] = useState(false);
  const index = TABS.findIndex((t) => t.id === active);

  useEffect(() => {
    if (!busy) return;
    const t = window.setTimeout(() => setBusy(false), 520);

    return () => window.clearTimeout(t);
  }, [busy, active]);

  return (
    <div className="flex h-full flex-col gap-4 p-5 sm:flex-row sm:gap-5 sm:p-6">
      <div className="flex flex-col sm:w-[40%] sm:shrink-0">
        <Eyebrow className="text-glacier-ink">AWS · Amazon Q</Eyebrow>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <h2 className="title text-[26px] lg:text-[28px]">Q artifacts</h2>
          <TextLink
            className="sm:hidden"
            href={projects.artifacts.href}
            label="Docs for Amazon Q chat artifacts"
          >
            Docs
          </TextLink>
        </div>
        <p className="mt-2 text-[15px] leading-snug text-muted">
          Answers that arrive as live charts and tables you can sort and
          explore.
        </p>
        <div className="mt-auto pt-3 max-sm:hidden">
          <TextLink
            href={projects.artifacts.href}
            label="Read the docs for Amazon Q chat artifacts"
          >
            Read the docs
          </TextLink>
        </div>
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col gap-2 rounded-[20px] bg-inset p-2.5 ring-1 ring-line ring-inset [container-type:size]"
        data-nodrag
      >
        <div
          className="relative grid grid-cols-3 rounded-full bg-ink/[0.06] p-0.5 dark:bg-white/[0.07]"
          role="tablist"
        >
          <span
            aria-hidden
            className="lg absolute inset-y-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-full bg-card/80 shadow-[0_2px_8px_-2px_rgb(0_0_0/0.2)] transition-transform duration-500 ease-[cubic-bezier(.3,1.35,.5,1)] [--lg-blur:0px] [backdrop-filter:none] dark:bg-white/15"
            style={{ transform: `translateX(${index * 100}%)` }}
          />
          {TABS.map((t) => (
            <button
              key={t.id}
              aria-selected={t.id === active}
              className={cn(
                "relative z-10 h-7 rounded-full text-[12px] font-medium transition-colors",
                t.id === active ? "text-ink" : "text-muted hover:text-ink",
              )}
              data-cursor="Ask Q"
              role="tab"
              type="button"
              onClick={() => {
                if (t.id === active) return;
                setActive(t.id);
                setBusy(true);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="ml-auto max-w-[90%] truncate rounded-[14px] rounded-br-[5px] bg-glacier-ink px-2.5 py-1 text-[11.5px] text-white [@container(height<185px)]:hidden dark:text-[#06223a]">
          {TABS[index].prompt}
        </p>
        <div className="relative min-h-0 flex-1 rounded-[14px] bg-card/75 p-2.5 dark:bg-black/25">
          {busy ? (
            <div className="h-full animate-shimmer rounded-[10px] bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--glacier)_14%,transparent),transparent)] bg-[length:200%_100%]" />
          ) : (
            <div
              key={active}
              className="h-full [animation:rise_.45s_cubic-bezier(.2,.8,.2,1)_both]"
            >
              {active === "chart" && <RegionChart />}
              {active === "table" && <InstanceTable />}
              {active === "forecast" && <ForecastChart />}
            </div>
          )}
        </div>
        <SampleNote className="text-right" />
      </div>
    </div>
  );
}
