"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";

import {
  buildLensMap,
  supportsBackdropRefraction,
  type LensMap,
} from "./displacement";

import { cn } from "@/lib/utils";

/* ---------- Light: the cursor is the light source for every glass surface ---------- */

const litElements = new Set<HTMLElement>();
let lightFrame = 0;
let lightX = -1;
let lightY = -1;
let lightBound = false;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

function paintLight() {
  lightFrame = 0;
  const vh = window.innerHeight;

  litElements.forEach((el) => {
    const r = el.getBoundingClientRect();

    if (r.bottom < -80 || r.top > vh + 80 || !r.width) return;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const angle = (Math.atan2(cx - lightX, -(cy - lightY)) * 180) / Math.PI;

    el.style.setProperty("--la", `${angle.toFixed(1)}deg`);
    el.style.setProperty(
      "--lx",
      `${clamp(((lightX - r.left) / r.width) * 100, -30, 130).toFixed(1)}%`,
    );
    el.style.setProperty(
      "--ly",
      `${clamp(((lightY - r.top) / r.height) * 100, -60, 160).toFixed(1)}%`,
    );
  });
}

function onPointerMove(e: PointerEvent) {
  if (e.pointerType === "touch") return;
  lightX = e.clientX;
  lightY = e.clientY;
  if (!lightFrame) lightFrame = requestAnimationFrame(paintLight);
}

export function registerLight(el: HTMLElement) {
  litElements.add(el);
  if (!lightBound) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    lightBound = true;
  }

  return () => {
    litElements.delete(el);
  };
}

/* ---------- Refraction filter ---------- */

export function GlassFilter({
  id,
  map,
  blur = 0.5,
  chroma = 0,
  saturate = 1.5,
}: {
  id: string;
  map: LensMap;
  blur?: number;
  chroma?: number;
  saturate?: number;
}) {
  const { url, scale, width, height } = map;
  const displace = (s: number, result: string) => (
    <feDisplacementMap
      in="blur"
      in2="map"
      result={result}
      scale={s}
      xChannelSelector="R"
      yChannelSelector="G"
    />
  );

  return (
    <svg
      aria-hidden
      height="0"
      style={{ position: "absolute", pointerEvents: "none" }}
      width="0"
    >
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height={height}
          id={id}
          primitiveUnits="userSpaceOnUse"
          width={width}
          x="0"
          y="0"
        >
          <feGaussianBlur
            in="SourceGraphic"
            result="blur"
            stdDeviation={blur}
          />
          <feImage
            height={height}
            href={url}
            preserveAspectRatio="none"
            result="map"
            width={width}
            x="0"
            y="0"
          />
          {chroma > 0 ? (
            <>
              {displace(scale * (1 + chroma), "dr")}
              <feColorMatrix
                in="dr"
                result="r"
                type="matrix"
                values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
              />
              {displace(scale, "dg")}
              <feColorMatrix
                in="dg"
                result="g"
                type="matrix"
                values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"
              />
              {displace(scale * (1 - chroma), "db")}
              <feColorMatrix
                in="db"
                result="b"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"
              />
              <feBlend in="r" in2="g" mode="screen" result="rg" />
              <feBlend in="rg" in2="b" mode="screen" result="disp" />
            </>
          ) : (
            displace(scale, "disp")
          )}
          <feColorMatrix in="disp" type="saturate" values={String(saturate)} />
        </filter>
      </defs>
    </svg>
  );
}

export type GlassOptions = {
  /** Width of the curved rim in px (defaults to ~1/3 of the shorter side). */
  bezel?: number;
  /** Glass thickness in px: drives how strongly the rim bends light. */
  thickness?: number;
  /** >1 turns the glass into a loupe. */
  magnify?: number;
  /** Corner radius in px; read from CSS when omitted. */
  radius?: number;
  blur?: number;
  chroma?: number;
  saturate?: number;
  /** Set false to keep the frosted fallback even in Chromium. */
  refract?: boolean;
};

/** Just the specular rim that follows the light, for glass that doesn't refract. */
export function useGlassLight(ref: RefObject<HTMLElement | null>) {
  useEffect(
    () => (ref.current ? registerLight(ref.current) : undefined),
    [ref],
  );
}

/**
 * Turns the element in `ref` into liquid glass: real refraction through an
 * SVG displacement map in Chromium, frosted glass elsewhere, and a specular
 * rim that tracks the cursor everywhere.
 */
export function useLiquidGlass(
  ref: RefObject<HTMLElement | null>,
  options: GlassOptions = {},
) {
  const id = `lg${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [map, setMap] = useState<LensMap | null>(null);
  const { bezel, thickness, magnify, radius, refract = true } = options;

  useEffect(() => {
    const el = ref.current;

    if (!el) return;
    const unlight = registerLight(el);

    if (!refract || !supportsBackdropRefraction()) return unlight;

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const w = el.offsetWidth;
        const h = el.offsetHeight;

        if (!w || !h) return;
        const r =
          radius ?? (parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0);
        const short = Math.min(w, h);

        setMap(
          buildLensMap({
            width: w,
            height: h,
            radius: r,
            bezel: bezel ?? short * 0.34,
            thickness: thickness ?? short * 0.5,
            magnify,
          }),
        );
      });
    };

    measure();
    const ro = new ResizeObserver(measure);

    ro.observe(el);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
      unlight();
    };
  }, [ref, bezel, thickness, magnify, radius, refract]);

  return {
    glassProps: {
      "data-refract": map ? ("true" as const) : undefined,
      style: map
        ? ({ "--lg-filter": `url(#${id})` } as CSSProperties)
        : undefined,
    },
    filter: map ? (
      <GlassFilter
        blur={options.blur}
        chroma={options.chroma}
        id={id}
        map={map}
        saturate={options.saturate}
      />
    ) : null,
  };
}

type LiquidGlassProps = HTMLAttributes<HTMLDivElement> & {
  glass?: GlassOptions;
  children?: ReactNode;
};

export function LiquidGlass({
  glass,
  className,
  style,
  children,
  ...rest
}: LiquidGlassProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { glassProps, filter } = useLiquidGlass(ref, glass);

  return (
    <div
      ref={ref}
      {...rest}
      className={cn("lg", className)}
      data-refract={glassProps["data-refract"]}
      style={{ ...style, ...glassProps.style }}
    >
      {filter}
      <span aria-hidden className="lg-caustic" />
      {children}
    </div>
  );
}
