"use client";

import { useTheme } from "next-themes";
import { type CSSProperties, useEffect, useId, useState } from "react";

import {
  FOOTHILLS,
  RAINIER,
  RAINIER_SNOW,
  SEATTLE_HILLS,
  SKYLINE_SIZE,
} from "./rainier-skyline";

import { switchTheme } from "@/lib/theme-transition";
import { cn } from "@/lib/utils";

type Phase = "night" | "dawn" | "day" | "dusk";

const TZ = "America/Los_Angeles";
const SYNODIC_DAYS = 29.530588853;
/** A known new moon, 2000-01-06 18:14 UTC. */
const NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);
const MOON_NAMES = [
  "New moon",
  "Waxing crescent",
  "First quarter",
  "Waxing gibbous",
  "Full moon",
  "Waning gibbous",
  "Last quarter",
  "Waning crescent",
];

/** Sky, horizon glow, and landscape colors for each part of the day. */
const PALETTE: Record<
  Phase,
  {
    sky: string;
    glow: string;
    far: string;
    snow: string;
    snowShade: string;
    mid: string;
    near: string;
  }
> = {
  night: {
    sky: "linear-gradient(180deg,#050b1f 0%,#0b1736 46%,#172a52 80%,#22365e 100%)",
    glow: "rgb(255 176 128 / 0.16)",
    far: "#2b3b60",
    snow: "#d5dff1",
    snowShade: "#8fa2c6",
    mid: "#17223e",
    near: "#0a1022",
  },
  dawn: {
    sky: "linear-gradient(180deg,#27356b 0%,#6a5a92 38%,#d48aa0 70%,#ffc39b 100%)",
    glow: "rgb(255 214 170 / 0.5)",
    far: "#6f5f88",
    snow: "#ffdcd2",
    snowShade: "#df9fa5",
    mid: "#3d3259",
    near: "#1f1931",
  },
  day: {
    sky: "linear-gradient(180deg,#2f80d6 0%,#5ea5ec 45%,#9fcdf6 82%,#d6ecfd 100%)",
    glow: "rgb(255 255 255 / 0.35)",
    far: "#86a2c6",
    snow: "#ffffff",
    snowShade: "#cfdbec",
    mid: "#5d7ca3",
    near: "#3a5476",
  },
  dusk: {
    sky: "linear-gradient(180deg,#1b2457 0%,#5b3f80 40%,#c45f80 72%,#ff9b63 100%)",
    glow: "rgb(255 170 110 / 0.45)",
    far: "#5e4b75",
    snow: "#ffc6b4",
    snowShade: "#d68b93",
    mid: "#352a52",
    near: "#1a1630",
  },
};

/** The last hour or so of daylight, when the light turns warm. */
const GOLDEN: (typeof PALETTE)["day"] = {
  sky: "linear-gradient(180deg,#3a78c6 0%,#78a7dc 42%,#e6c09a 84%,#ffd2a0 100%)",
  glow: "rgb(255 200 140 / 0.5)",
  far: "#8b92b4",
  snow: "#fff1de",
  snowShade: "#e0c2b2",
  mid: "#5f6e98",
  near: "#3b496f",
};

// Integer LCG so the star field is identical on the server and in every browser.
let seed = 11;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const STARS = Array.from({ length: 30 }, () => {
  const size = rand();

  return {
    x: (rand() * 100).toFixed(1),
    y: (rand() * 66).toFixed(1),
    size: size < 0.12 ? 2 : size < 0.45 ? 1.5 : 1,
    opacity: (0.3 + rand() * 0.6).toFixed(2),
    twinkle: rand() < 0.3 ? (2.4 + rand() * 3).toFixed(1) : null,
  };
});

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const clock = (h: number) => {
  const minutes = Math.round(h * 60) % (24 * 60);
  const hh = Math.floor(minutes / 60);

  return `${((hh + 11) % 12) + 1}:${String(minutes % 60).padStart(2, "0")} ${hh >= 12 ? "PM" : "AM"}`;
};

const LAT = 47.6062;
const LON = -122.3321;
const rad = Math.PI / 180;

/** Sunrise, solar noon, and sunset in local hours (NOAA's solar equations, accurate to about a minute). */
function sunTimes(doy: number, utcOffset: number) {
  const g = ((2 * Math.PI) / 365) * (doy - 1);
  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(g) -
      0.032077 * Math.sin(g) -
      0.014615 * Math.cos(2 * g) -
      0.040849 * Math.sin(2 * g));
  const decl =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g);
  const ha =
    Math.acos(
      Math.cos(90.833 * rad) / (Math.cos(LAT * rad) * Math.cos(decl)) -
        Math.tan(LAT * rad) * Math.tan(decl),
    ) / rad;
  const local = (minutes: number) => minutes / 60 + utcOffset;

  return {
    rise: local(720 - 4 * (LON + ha) - eqTime),
    noon: local(720 - 4 * LON - eqTime),
    set: local(720 - 4 * (LON - ha) - eqTime),
  };
}

/** Seattle's sky right now: the sun's real position and the moon's phase and rough place. */
function seattleSky(now: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hour: "numeric",
      minute: "2-digit",
      hourCycle: "h23",
      timeZoneName: "short",
      month: "numeric",
      day: "numeric",
      year: "numeric",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const hour = Number(parts.hour) + Number(parts.minute) / 60;
  const year = Number(parts.year);
  const doy =
    (Date.UTC(year, Number(parts.month) - 1, Number(parts.day)) -
      Date.UTC(year, 0, 0)) /
    864e5;
  const { rise, noon, set } = sunTimes(
    doy,
    parts.timeZoneName === "PDT" ? -7 : -8,
  );

  let phase: Phase = "night";

  if (hour >= rise - 0.6 && hour < rise + 0.7) phase = "dawn";
  else if (hour >= rise + 0.7 && hour < set - 0.8) phase = "day";
  else if (hour >= set - 0.8 && hour < set + 0.6) phase = "dusk";

  // The moon transits about age × 24.8 h after the sun and is up for roughly 12.4 h.
  const age =
    ((((now.getTime() - NEW_MOON) / 864e5 / SYNODIC_DAYS) % 1) + 1) % 1;
  const moon = ((((hour - (noon + age * 24.8 - 6.2)) % 24) + 24) % 24) / 12.4;

  let label = MOON_NAMES[Math.round(age * 8) % 8];

  if (phase === "dawn") label = hour < rise ? "First light" : "Sunrise";
  else if (phase === "dusk") label = hour < set ? "Sunset" : "Blue hour";
  else if (phase === "day")
    label = hour > set - 1.8 ? "Golden hour" : "Daylight";

  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  }).format(now);
  const sunUp = hour >= rise && hour < set;

  return {
    phase,
    label,
    next: sunUp ? `Sunset ${clock(set)}` : `Sunrise ${clock(rise)}`,
    time: time.replace(/\s?[AP]M$/, ""),
    meridiem: /PM$/.test(time) ? "PM" : "AM",
    sun: (hour - rise) / (set - rise),
    moon,
    age,
  };
}

/** Position along the sky's arc, from the left horizon (0) to the right (1). */
const arc = (p: number): CSSProperties => ({
  left: `${6 + p * 88}%`,
  top: `${78 - Math.sin(Math.PI * Math.min(1, Math.max(0, p))) * 30}%`,
});

/** The moon's lit shape for its age (0 new, 0.5 full), as seen from the northern hemisphere. */
function Moon({
  age,
  className,
  craters,
}: {
  age: number;
  className?: string;
  craters?: boolean;
}) {
  const clip = useId().replace(/[^\w-]/g, "");
  const k = Math.cos(2 * Math.PI * age);
  const waxing = age < 0.5;
  const lit = `M0 -10A10 10 0 0 ${waxing ? 1 : 0} 0 10A${(Math.abs(k) * 10).toFixed(2)} 10 0 0 ${
    waxing === k > 0 ? 0 : 1
  } 0 -10Z`;

  return (
    <svg aria-hidden className={className} viewBox="-11 -11 22 22">
      <circle fill="currentColor" opacity="0.16" r="10" />
      <path d={lit} fill="currentColor" />
      {craters && (
        <>
          <clipPath id={clip}>
            <path d={lit} />
          </clipPath>
          <g clipPath={`url(#${clip})`} fill="#5b6478" opacity="0.18">
            <circle cx="-3.2" cy="-3.4" r="2.6" />
            <circle cx="3.6" cy="1.6" r="1.9" />
            <circle cx="-1.2" cy="4.8" r="1.4" />
            <circle cx="4.4" cy="-4.6" r="1.1" />
          </g>
        </>
      )}
    </svg>
  );
}

const DIGITS =
  "font-display text-[46px] font-semibold tracking-[-0.025em] tabular-nums sm:text-[58px]";

/**
 * Clock digits made of glass, like the iOS 26 Lock Screen: a clear body that
 * lets the sky through, a bevel lit from the upper left, and a bright top rim.
 */
function GlassTime({ time, meridiem }: { time: string; meridiem: string }) {
  const id = useId().replace(/[^\w-]/g, "");

  return (
    <svg
      aria-label={time ? `${time} ${meridiem}` : undefined}
      className={cn(
        "mt-1 block h-[44px] w-full overflow-visible transition-opacity duration-500 sm:h-[56px]",
        time ? "opacity-100" : "opacity-0",
      )}
      role="img"
    >
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          height="170%"
          id={id}
          width="130%"
          x="-15%"
          y="-35%"
        >
          <feFlood floodColor="#fff" floodOpacity="0.16" />
          <feComposite in2="SourceAlpha" operator="in" result="body" />
          <feGaussianBlur in="SourceAlpha" result="height" stdDeviation="1.5" />
          <feSpecularLighting
            in="height"
            lightingColor="#fff"
            result="light"
            specularConstant="1.2"
            specularExponent="14"
            surfaceScale="3.2"
          >
            <feDistantLight azimuth="225" elevation="40" />
          </feSpecularLighting>
          <feComposite
            in="light"
            in2="SourceAlpha"
            operator="in"
            result="gloss"
          />
          <feOffset dy="1.2" in="SourceAlpha" result="down" />
          <feComposite
            in="SourceAlpha"
            in2="down"
            operator="out"
            result="edge"
          />
          <feFlood floodColor="#fff" floodOpacity="0.9" />
          <feComposite in2="edge" operator="in" result="rim" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
          <feOffset dy="3" result="drop" />
          <feFlood floodColor="#020617" floodOpacity="0.28" />
          <feComposite in2="drop" operator="in" />
          <feComposite in2="SourceAlpha" operator="out" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="body" />
            <feMergeNode in="gloss" />
            <feMergeNode in="rim" />
          </feMerge>
        </filter>
      </defs>
      <text
        className={DIGITS}
        fill="#fff"
        filter={`url(#${id})`}
        x="0"
        y="0.84em"
      >
        {time}
      </text>
      {/* An invisible copy of the digits sets the pen position for AM/PM. */}
      <text aria-hidden className={DIGITS} x="0" y="0.84em">
        <tspan fill="none">{time}</tspan>
        <tspan
          className="text-[13px] font-semibold tracking-normal"
          dx="6"
          fill="rgb(255 255 255 / 0.85)"
        >
          {meridiem}
        </tspan>
      </text>
    </svg>
  );
}

function PhaseIcon({ phase, age }: { phase: Phase; age: number }) {
  if (phase === "night") return <Moon age={age} className="size-[13px]" />;
  if (phase === "day") {
    return (
      <svg aria-hidden className="size-[13px]" fill="none" viewBox="0 0 16 16">
        <circle cx="8" cy="8" fill="currentColor" r="3.2" />
        <path
          d="M8 1.6v1.5M8 12.9v1.5M1.6 8h1.5M12.9 8h1.5M3.5 3.5l1 1M11.5 11.5l1 1M3.5 12.5l1-1M11.5 4.5l1-1"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.4"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden className="size-[13px]" fill="none" viewBox="0 0 16 16">
      <path d="M4.4 11.6a3.6 3.6 0 0 1 7.2 0Z" fill="currentColor" />
      <path
        d={
          phase === "dawn"
            ? "M1.5 11.6h13M8 2v3.6M6.4 3.6 8 2l1.6 1.6"
            : "M1.5 11.6h13M8 2v3.6M6.4 4 8 5.6 9.6 4"
        }
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

/**
 * An Apple Weather-style widget for Seattle's real sky right now: the sun or
 * the moon in its actual phase over Mount Rainier's true skyline from Kerry
 * Park. It doubles as the light switch for the site.
 */
export function SkyCard() {
  const { resolvedTheme, setTheme } = useTheme();
  const [sky, setSky] = useState<ReturnType<typeof seattleSky> | null>(null);

  useEffect(() => {
    const tick = () => setSky(seattleSky(new Date()));

    tick();
    const id = window.setInterval(tick, 20_000);

    return () => window.clearInterval(id);
  }, []);

  const phase = sky?.phase ?? "night";
  const colors = sky?.label === "Golden hour" ? GOLDEN : PALETTE[phase];
  const [width, height] = SKYLINE_SIZE;
  const sunVisible = sky !== null && sky.sun >= -0.02 && sky.sun <= 1.02;
  const moonVisible =
    sky !== null && sky.moon <= 1 && sky.age > 0.03 && sky.age < 0.97;

  return (
    <div
      className="relative h-full overflow-hidden text-white transition-[background] duration-1000"
      style={
        {
          background: colors.sky,
          "--far": colors.far,
          "--snow": colors.snow,
          "--snow-shade": colors.snowShade,
          "--mid": colors.mid,
          "--near": colors.near,
        } as CSSProperties
      }
    >
      <div
        aria-hidden
        className="absolute inset-0 transition-[background] duration-1000"
        style={{
          background: `radial-gradient(85% 42% at 58% 84%, ${colors.glow}, transparent 72%)`,
        }}
      />

      <div
        aria-hidden
        className={cn(
          "absolute inset-0 transition-opacity duration-1000",
          phase === "night"
            ? "opacity-100"
            : phase === "day"
              ? "opacity-0"
              : "opacity-40",
        )}
      >
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
              animation: s.twinkle
                ? `twinkle ${s.twinkle}s ease-in-out ${-i * 0.7}s infinite`
                : undefined,
            }}
          />
        ))}
      </div>

      {sky && moonVisible && (
        <span
          aria-hidden
          className={cn(
            "absolute -translate-x-1/2 -translate-y-1/2 text-[#f5f1e4] transition-opacity duration-1000 [animation:fade-in_1s_ease_both]",
            phase === "day" ? "opacity-50" : "opacity-100",
          )}
          style={arc(sky.moon)}
        >
          <span className="absolute -inset-3 rounded-full bg-[radial-gradient(closest-side,rgb(245_241_228/0.3),transparent)]" />
          <Moon
            craters
            age={sky.age}
            className="relative block size-[17px] sm:size-5"
          />
        </span>
      )}

      {sky && sunVisible && (
        <span
          aria-hidden
          className="absolute size-[18px] -translate-x-1/2 -translate-y-1/2 [animation:fade-in_1s_ease_both] sm:size-[22px]"
          style={arc(sky.sun)}
        >
          <span
            className={cn(
              "absolute -inset-[180%] rounded-full",
              phase === "day"
                ? "bg-[radial-gradient(closest-side,rgb(255_236_180/0.5),transparent)]"
                : "bg-[radial-gradient(closest-side,rgb(255_170_110/0.6),transparent)]",
            )}
          />
          <span
            className={cn(
              "absolute inset-0 rounded-full",
              phase === "day"
                ? "bg-[radial-gradient(circle,#fffef8_45%,#fff1c2)] shadow-[0_0_16px_4px_rgb(255_240_200/0.7)]"
                : "bg-[radial-gradient(circle,#fff3dc_40%,#ffc58a)] shadow-[0_0_18px_6px_rgb(255_170_110/0.55)]",
            )}
          />
        </span>
      )}

      <svg
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[44%] w-full"
        preserveAspectRatio="xMidYMax slice"
        viewBox={`${width * 0.29} 0 ${width * 0.56} ${height}`}
      >
        <defs>
          <linearGradient id="rainier-snow" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0.2" stopColor="var(--snow)" />
            <stop offset="0.85" stopColor="var(--snow-shade)" />
          </linearGradient>
        </defs>
        <path
          className="transition-[fill] duration-1000"
          d={RAINIER}
          fill="var(--far)"
        />
        <path d={RAINIER_SNOW} fill="url(#rainier-snow)" />
        <path
          className="transition-[fill] duration-1000"
          d={FOOTHILLS}
          fill="var(--mid)"
        />
        <path
          className="transition-[fill] duration-1000"
          d={SEATTLE_HILLS}
          fill="var(--near)"
        />
      </svg>

      <div
        aria-hidden
        className="absolute inset-0 opacity-25 mix-blend-soft-light"
        style={{ backgroundImage: GRAIN }}
      />

      <div className="relative flex h-full flex-col justify-between p-4 [text-shadow:0_1px_10px_rgb(0_0_0/0.18)] sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 leading-none">
            <p className="flex items-center gap-1 text-[15px] font-semibold">
              Seattle
              <svg
                aria-hidden
                className="size-[10px] opacity-90"
                viewBox="0 0 16 16"
              >
                <path
                  d="M14.2 1.8 2.3 6.9c-.6.3-.5 1.1.1 1.2l4.9 1 1 4.9c.1.6.9.7 1.2.1L14.2 1.8Z"
                  fill="currentColor"
                />
              </svg>
            </p>
            <GlassTime meridiem={sky?.meridiem ?? ""} time={sky?.time ?? ""} />
          </div>
          <button
            aria-label="Toggle dark mode"
            className="lg grid size-8 shrink-0 place-items-center rounded-full text-white [--glass-ink:#fff] [--glass-tint:rgb(255_255_255/0.14)]"
            data-cursor="Lights"
            type="button"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();

              switchTheme(
                resolvedTheme === "dark" ? "light" : "dark",
                setTheme,
                {
                  x: r.left + r.width / 2,
                  y: r.top + r.height / 2,
                },
              );
            }}
          >
            <span className="lg-caustic" />
            <svg aria-hidden className="size-4" fill="none" viewBox="0 0 16 16">
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path d="M8 2a6 6 0 0 1 0 12Z" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div
          className={cn(
            "text-[13px] leading-[1.3] transition-opacity duration-500",
            sky ? "opacity-100" : "opacity-0",
          )}
        >
          <p className="flex items-center gap-1.5 font-semibold">
            {sky && <PhaseIcon age={sky.age} phase={phase} />}
            {sky?.label ?? "Seattle"}
          </p>
          <p className="opacity-85">{sky?.next ?? "Sunrise"}</p>
        </div>
      </div>
    </div>
  );
}
