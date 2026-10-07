#!/usr/bin/env python3
"""Generate the Mount Rainier contour lines used by the site background.

Downloads Terrarium elevation tiles from the AWS Open Data "Terrain Tiles"
bucket, traces contour lines with marching squares, simplifies them, and
writes a compact delta-encoded JSON file to public/data/rainier-topo.json.

Depends on numpy and Pillow. Run with: python3 scripts/gen-topo.py
Data: Terrain Tiles (https://registry.opendata.aws/terrain-tiles/),
sources include USGS 3DEP/NED and SRTM.
"""

import io
import json
import math
import os
import urllib.request
import zlib
from collections import defaultdict

import numpy as np
from PIL import Image

SUMMIT = (46.8523, -121.7603)  # Columbia Crest
LAT_SPAN = 0.17  # degrees each side of the summit
LON_SPAN = 0.25
ZOOM = 12
GRID = 300  # output grid resolution (cells along the longer side)
LEVEL_STEP = 150  # metres between contour lines
MIN_LEVEL = 600
SMOOTH_SIGMA = 1.6
SIMPLIFY = 0.35  # Ramer-Douglas-Peucker tolerance in grid cells
OUT_SCALE = 1000  # output coordinate space (longer side)
TILE_URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "data", "rainier-topo.json")


def lon_to_x(lon, z):
    return (lon + 180.0) / 360.0 * (1 << z)


def lat_to_y(lat, z):
    r = math.radians(lat)
    return (1.0 - math.log(math.tan(r) + 1.0 / math.cos(r)) / math.pi) / 2.0 * (1 << z)


def fetch_tile(x, y, z):
    """Fetch one tile; set TOPO_CACHE to a directory to reuse downloads."""
    cache = os.environ.get("TOPO_CACHE")
    path = cache and os.path.join(cache, f"{z}-{x}-{y}.png")
    if path and os.path.exists(path):
        data = open(path, "rb").read()
    else:
        with urllib.request.urlopen(TILE_URL.format(z=z, x=x, y=y), timeout=60) as r:
            data = r.read()
        if path:
            os.makedirs(cache, exist_ok=True)
            open(path, "wb").write(data)
    rgb = np.asarray(Image.open(io.BytesIO(data)).convert("RGB"), dtype=np.float64)
    return rgb[:, :, 0] * 256 + rgb[:, :, 1] + rgb[:, :, 2] / 256 - 32768


def gaussian(a, sigma):
    radius = int(math.ceil(sigma * 3))
    k = np.exp(-0.5 * (np.arange(-radius, radius + 1) / sigma) ** 2)
    k /= k.sum()
    pad = np.pad(a, radius, mode="edge")
    tmp = np.apply_along_axis(lambda m: np.convolve(m, k, mode="valid"), 1, pad)
    return np.apply_along_axis(lambda m: np.convolve(m, k, mode="valid"), 0, tmp)


def marching_squares(grid, level):
    """Return contour segments as (x0, y0, x1, y1) in grid coordinates."""
    h, w = grid.shape
    tl, tr = grid[:-1, :-1], grid[:-1, 1:]
    bl, br = grid[1:, :-1], grid[1:, 1:]
    idx = (tl > level) * 8 + (tr > level) * 4 + (br > level) * 2 + (bl > level) * 1
    ys, xs = np.nonzero((idx > 0) & (idx < 15))
    segs = []

    def interp(a, b):
        d = b - a
        return 0.5 if d == 0 else (level - a) / d

    for y, x in zip(ys, xs):
        a, b, c, d = tl[y, x], tr[y, x], br[y, x], bl[y, x]
        top = (x + interp(a, b), y)
        right = (x + 1, y + interp(b, c))
        bottom = (x + interp(d, c), y + 1)
        left = (x, y + interp(a, d))
        case = idx[y, x]
        pairs = {
            1: [(left, bottom)], 2: [(bottom, right)], 3: [(left, right)],
            4: [(top, right)], 6: [(top, bottom)], 7: [(left, top)],
            8: [(left, top)], 9: [(top, bottom)], 11: [(top, right)],
            12: [(left, right)], 13: [(bottom, right)], 14: [(left, bottom)],
            5: [(left, top), (bottom, right)], 10: [(top, right), (left, bottom)],
        }[case]
        segs.extend(pairs)
    return segs


def join_segments(segs):
    key = lambda p: (round(p[0], 4), round(p[1], 4))
    ends = defaultdict(list)
    for i, (p, q) in enumerate(segs):
        ends[key(p)].append(i)
        ends[key(q)].append(i)
    used = [False] * len(segs)
    lines = []
    for i in range(len(segs)):
        if used[i]:
            continue
        used[i] = True
        line = [segs[i][0], segs[i][1]]
        for forward in (True, False):
            while True:
                tip = line[-1] if forward else line[0]
                nxt = None
                for j in ends[key(tip)]:
                    if not used[j]:
                        nxt = j
                        break
                if nxt is None:
                    break
                used[nxt] = True
                p, q = segs[nxt]
                other = q if key(p) == key(tip) else p
                if forward:
                    line.append(other)
                else:
                    line.insert(0, other)
        lines.append(line)
    return lines


def rdp(points, eps):
    if len(points) < 3:
        return points
    pts = np.asarray(points)
    keep = np.zeros(len(pts), dtype=bool)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        s, e = stack.pop()
        if e <= s + 1:
            continue
        seg = pts[e] - pts[s]
        norm = np.hypot(*seg)
        v = pts[s + 1 : e] - pts[s]
        if norm < 1e-9:  # closed ring: measure distance from the start point
            d = np.hypot(v[:, 0], v[:, 1])
        else:
            d = np.abs(seg[0] * v[:, 1] - seg[1] * v[:, 0]) / norm
        i = int(np.argmax(d))
        if d[i] > eps:
            keep[s + 1 + i] = True
            stack.append((s, s + 1 + i))
            stack.append((s + 1 + i, e))
    return [tuple(p) for p in pts[keep]]


def main():
    lat0, lon0 = SUMMIT
    north, south = lat0 + LAT_SPAN, lat0 - LAT_SPAN
    west, east = lon0 - LON_SPAN, lon0 + LON_SPAN
    fx0, fx1 = lon_to_x(west, ZOOM), lon_to_x(east, ZOOM)
    fy0, fy1 = lat_to_y(north, ZOOM), lat_to_y(south, ZOOM)
    tx0, tx1, ty0, ty1 = int(fx0), int(fx1), int(fy0), int(fy1)
    rows = []
    for ty in range(ty0, ty1 + 1):
        row = []
        for tx in range(tx0, tx1 + 1):
            print(f"tile {ZOOM}/{tx}/{ty}")
            row.append(fetch_tile(tx, ty, ZOOM))
        rows.append(np.hstack(row))
    mosaic = np.vstack(rows)
    px0, px1 = int((fx0 - tx0) * 256), int((fx1 - tx0) * 256)
    py0, py1 = int((fy0 - ty0) * 256), int((fy1 - ty0) * 256)
    elev = mosaic[py0:py1, px0:px1]

    # Resample so the longer side has GRID cells (block mean keeps it smooth).
    h, w = elev.shape
    step = max(h, w) / GRID
    gh, gw = int(h / step), int(w / step)
    ys = (np.arange(gh + 1) * step).astype(int)
    xs = (np.arange(gw + 1) * step).astype(int)
    grid = np.array([[elev[ys[i] : ys[i + 1], xs[j] : xs[j + 1]].mean() for j in range(gw)] for i in range(gh)])
    grid = gaussian(grid, SMOOTH_SIGMA)

    sy = (lat_to_y(lat0, ZOOM) - ty0) * 256 - py0
    sx = (lon_to_x(lon0, ZOOM) - tx0) * 256 - px0
    scale = OUT_SCALE / max(gw - 1, gh - 1)

    levels = []
    top = int(grid.max())
    for level in range(MIN_LEVEL, top, LEVEL_STEP):
        lines = join_segments(marching_squares(grid, level))
        enc = []
        for line in lines:
            if len(line) < 6:
                continue
            simple = rdp(line, SIMPLIFY)
            if len(simple) < 3:
                continue
            pts = [(round(x * scale), round(y * scale)) for x, y in simple]
            flat, px, py = [], 0, 0
            for i, (x, y) in enumerate(pts):
                if i and x == px and y == py:
                    continue
                flat += [x - px, y - py] if i else [x, y]
                px, py = x, y
            if len(flat) >= 6:
                enc.append(flat)
        if enc:
            levels.append({"e": level, "l": enc})
        print(f"level {level}: {len(enc)} lines")

    out = {
        "w": round((gw - 1) * scale),
        "h": round((gh - 1) * scale),
        "summit": [round(sx / step * scale), round(sy / step * scale)],
        "step": LEVEL_STEP,
        "levels": levels,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    raw = os.path.getsize(OUT)
    gz = len(zlib.compress(open(OUT, "rb").read(), 9))
    print(f"wrote {OUT}: {raw / 1024:.1f}KB raw, ~{gz / 1024:.1f}KB compressed, max elev {grid.max():.0f}m")


if __name__ == "__main__":
    main()
