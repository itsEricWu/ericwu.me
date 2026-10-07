import { isWebKit } from "@/lib/utils";

/**
 * Liquid glass optics.
 *
 * The glass is modelled as a slab whose edge (the bezel) rises with a convex
 * squircle profile. For every pixel we trace a vertical ray through that
 * surface with Snell's law (air -> glass, n = 1.5) and record how far
 * sideways it lands on the background. The offsets are encoded into the
 * red/green channels of an image that drives an SVG feDisplacementMap.
 */

export type LensOptions = {
  width: number;
  height: number;
  /** Corner radius in px. Clamped to half of the shorter side. */
  radius: number;
  /** Width of the curved rim in px. */
  bezel: number;
  /** Glass thickness in px: more thickness, stronger refraction at the rim. */
  thickness: number;
  /** >1 magnifies the whole lens, like a loupe. */
  magnify?: number;
  ior?: number;
};

export type LensMap = {
  url: string;
  scale: number;
  width: number;
  height: number;
};

const SAMPLES = 128;

/** Convex squircle: flat top, soft roll-off into the edge (what Apple uses). */
const profile = (t: number) => Math.pow(1 - Math.pow(1 - t, 4), 0.25);

function rimTable(bezel: number, thickness: number, ior: number) {
  const table = new Float32Array(SAMPLES);
  const eta = 1 / ior;
  const d = 1 / (SAMPLES * 4);

  for (let i = 0; i < SAMPLES; i++) {
    const t = (i + 0.5) / SAMPLES;
    const h = thickness * profile(t);
    const slope =
      (thickness *
        (profile(Math.min(1, t + d)) - profile(Math.max(0, t - d)))) /
      (2 * d) /
      bezel;
    const len = Math.hypot(slope, 1);
    const nu = -slope / len;
    const nz = 1 / len;
    const k = 1 - eta * eta * (1 - nz * nz);

    if (k < 0) continue;
    const a = eta * nz - Math.sqrt(k);
    const tu = a * nu;
    const tz = -eta + a * nz;

    table[i] = h * (tu / -tz);
  }

  return table;
}

const cache = new Map<string, LensMap>();

export function buildLensMap(o: LensOptions): LensMap {
  const width = Math.max(2, Math.round(o.width));
  const height = Math.max(2, Math.round(o.height));
  const radius = Math.min(o.radius, width / 2, height / 2);
  const bezel = Math.max(1, Math.min(o.bezel, Math.min(width, height) / 2));
  const magnify = o.magnify ?? 1;
  const key = [width, height, radius, bezel, o.thickness, magnify, o.ior].join(
    ":",
  );
  const hit = cache.get(key);

  if (hit) return hit;

  const rim = rimTable(bezel, o.thickness, o.ior ?? 1.5);
  const zoom = magnify > 1 ? 1 - 1 / magnify : 0;
  const dx = new Float32Array(width * height);
  const dy = new Float32Array(width * height);
  const cx = width / 2;
  const cy = height / 2;
  const hx = cx - radius;
  const hy = cy - radius;
  let max = 0.0001;

  for (let y = 0; y < height; y++) {
    const py = y + 0.5 - cy;
    const qy = Math.abs(py) - hy;

    for (let x = 0; x < width; x++) {
      const px = x + 0.5 - cx;
      const qx = Math.abs(px) - hx;
      let sd: number;
      let nx = 0;
      let ny = 0;

      if (qx > 0 && qy > 0) {
        const l = Math.hypot(qx, qy);

        sd = l - radius;
        nx = (qx / l) * Math.sign(px);
        ny = (qy / l) * Math.sign(py);
      } else if (qx > qy) {
        sd = qx - radius;
        nx = Math.sign(px);
      } else {
        sd = qy - radius;
        ny = Math.sign(py);
      }

      const inside = -sd;

      if (inside < 0) continue;

      let ox = 0;
      let oy = 0;

      if (inside < bezel) {
        const offset =
          rim[Math.min(SAMPLES - 1, Math.floor((inside / bezel) * SAMPLES))];

        ox -= nx * offset;
        oy -= ny * offset;
      }
      if (zoom) {
        ox -= px * zoom;
        oy -= py * zoom;
      }

      const i = y * width + x;

      dx[i] = ox;
      dy[i] = oy;
      max = Math.max(max, Math.abs(ox), Math.abs(oy));
    }
  }

  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) return { url: "", scale: 0, width, height };

  const img = ctx.createImageData(width, height);

  for (let i = 0; i < width * height; i++) {
    const p = i * 4;

    img.data[p] = 128 + (dx[i] / max) * 127;
    img.data[p + 1] = 128 + (dy[i] / max) * 127;
    img.data[p + 2] = 128;
    img.data[p + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  // feDisplacementMap offsets by scale * (channel - 0.5), so double the max.
  const map = { url: canvas.toDataURL(), scale: max * 2, width, height };

  cache.set(key, map);

  return map;
}

let refraction: boolean | undefined;

/**
 * Only Chromium renders SVG filters inside backdrop-filter. Firefox parses
 * them and then draws nothing, so feature detection can't be trusted here.
 * WebKit draws the displacement out of place, so iOS browsers never get it,
 * whatever brands they report.
 */
export function supportsBackdropRefraction() {
  if (refraction !== undefined) return refraction;
  const nav = navigator as Navigator & {
    userAgentData?: { brands?: { brand: string }[] };
  };

  refraction =
    !isWebKit() &&
    !!nav.userAgentData?.brands?.some((b) => b.brand === "Chromium");

  return refraction;
}
