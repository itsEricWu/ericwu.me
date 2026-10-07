#!/usr/bin/env python3
"""Generate Mount Rainier's skyline as seen from Kerry Park, Seattle.

Casts rays over Terrarium elevation tiles from the AWS Open Data "Terrain
Tiles" bucket (with earth curvature and atmospheric refraction), keeps the
highest apparent angle per bearing, and writes SVG paths for the far massif,
its snowfield, and the nearer foothills to components/cards/rainier-skyline.ts.

Depends on numpy and Pillow. Run with: python3 scripts/gen-skyline.py
Set TOPO_CACHE to a directory to reuse downloaded tiles.
"""

import io
import math
import os
import urllib.request

import numpy as np
from PIL import Image

VIEWER = (47.6295, -122.3599)  # Kerry Park, Queen Anne Hill
EYE = 2.0  # metres above the ground
SUMMIT = (46.8523, -121.7603)  # Columbia Crest
ZOOM = 11
FOV = 24.0  # degrees of bearing across the widget
SUMMIT_AT = 0.64  # where the summit sits across the width (0..1)
STEP_AZ = 0.02  # degrees between rays
STEP_D = 40.0  # metres between samples along a ray
MAX_D = 125_000.0
FAR_FROM = 72_000.0  # samples beyond this belong to the Rainier massif
MID_FROM = 22_000.0  # foothills between here and FAR_FROM; Seattle's hills nearer
SNOWLINE = 1900.0  # metres; early autumn snow
EARTH_R = 6_371_000.0
K_REFRACTION = 0.13
VIEW_W = 200.0
EXAGGERATION = 1.8
SCALE = 5  # output units per view unit, so coordinates can be integers
TOLERANCE = 0.8  # RDP tolerance in output units
TILE_URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
OUT = os.path.join(os.path.dirname(__file__), "..", "components", "cards", "rainier-skyline.ts")


def fetch_tile(x, y, z):
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


def global_px(lat, lon, z):
    n = 256 * (1 << z)
    x = (lon + 180.0) / 360.0 * n
    r = np.radians(lat)
    y = (1.0 - np.log(np.tan(r) + 1.0 / np.cos(r)) / math.pi) / 2.0 * n
    return x, y


def destination(lat, lon, bearing, d):
    """Points d metres from (lat, lon) along each bearing (degrees), on a sphere."""
    p1, l1, b = math.radians(lat), math.radians(lon), np.radians(bearing)
    a = d / EARTH_R
    p2 = np.arcsin(math.sin(p1) * np.cos(a) + math.cos(p1) * np.sin(a) * np.cos(b))
    l2 = l1 + np.arctan2(np.sin(b) * np.sin(a) * math.cos(p1), np.cos(a) - math.sin(p1) * np.sin(p2))
    return np.degrees(p2), np.degrees(l2)


def bearing_to(a, b):
    p1, p2 = math.radians(a[0]), math.radians(b[0])
    dl = math.radians(b[1] - a[1])
    y = math.sin(dl) * math.cos(p2)
    x = math.cos(p1) * math.sin(p2) - math.sin(p1) * math.cos(p2) * math.cos(dl)
    return (math.degrees(math.atan2(y, x)) + 360) % 360


def rdp(points, eps):
    if len(points) < 3:
        return points
    a, b = points[0], points[-1]
    ab = b - a
    norm = np.hypot(*ab)
    d = np.abs(ab[0] * (points[:, 1] - a[1]) - ab[1] * (points[:, 0] - a[0])) / max(norm, 1e-9)
    i = int(np.argmax(d))
    if d[i] > eps:
        return np.vstack([rdp(points[: i + 1], eps)[:-1], rdp(points[i:], eps)])
    return np.array([a, b])


def path(points):
    """A compact closed SVG path in SCALE units, with relative segments.

    The ring is split at its farthest point so RDP keeps its shape."""
    ring = np.asarray(points, dtype=float) * SCALE
    far = int(np.argmax(np.hypot(*(ring - ring[0]).T)))
    pts = np.vstack([rdp(ring[: far + 1], TOLERANCE)[:-1], rdp(ring[far:], TOLERANCE)])
    pts = np.round(pts).astype(int)
    out = [f"M{pts[0][0]} {pts[0][1]}"]
    for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
        if (x1, y1) != (x0, y0):
            out.append(f"l{x1 - x0}{'' if y1 - y0 < 0 else ' '}{y1 - y0}")
    return "".join(out) + "z"


def main():
    az0 = bearing_to(VIEWER, SUMMIT)
    left = az0 - FOV * SUMMIT_AT
    bearings = np.arange(left, left + FOV + STEP_AZ / 2, STEP_AZ)
    dists = np.arange(300.0, MAX_D, STEP_D)

    lat, lon = destination(VIEWER[0], VIEWER[1], bearings[:, None], dists[None, :])
    gx, gy = global_px(lat, lon, ZOOM)
    tx0, ty0 = int(gx.min() // 256), int(gy.min() // 256)
    tx1, ty1 = int(gx.max() // 256), int(gy.max() // 256)
    dem = np.zeros(((ty1 - ty0 + 1) * 256, (tx1 - tx0 + 1) * 256))
    for ty in range(ty0, ty1 + 1):
        for tx in range(tx0, tx1 + 1):
            dem[(ty - ty0) * 256 : (ty - ty0 + 1) * 256, (tx - tx0) * 256 : (tx - tx0 + 1) * 256] = fetch_tile(tx, ty, ZOOM)

    # Bilinear sample.
    fx, fy = gx - tx0 * 256, gy - ty0 * 256
    x0, y0 = np.floor(fx).astype(int), np.floor(fy).astype(int)
    ax, ay = fx - x0, fy - y0
    h = (
        dem[y0, x0] * (1 - ax) * (1 - ay)
        + dem[y0, x0 + 1] * ax * (1 - ay)
        + dem[y0 + 1, x0] * (1 - ax) * ay
        + dem[y0 + 1, x0 + 1] * ax * ay
    )

    gx0, gy0 = global_px(np.array(VIEWER[0]), np.array(VIEWER[1]), ZOOM)
    eye = dem[int(gy0 - ty0 * 256), int(gx0 - tx0 * 256)] + EYE
    r_eff = EARTH_R / (1 - K_REFRACTION)
    angle = np.degrees(np.arctan2(h - eye - dists**2 / (2 * r_eff), dists))

    far = dists >= FAR_FROM
    mid = (dists >= MID_FROM) & ~far
    near = dists < MID_FROM
    far_sky = angle[:, far].max(axis=1)
    mid_sky = angle[:, mid].max(axis=1)
    near_sky = angle[:, near].max(axis=1)
    front_sky = np.maximum(mid_sky, near_sky)

    # Snow: visible far-field points above the snowline. A point is visible when
    # nothing nearer along the ray rises above it.
    running = np.maximum.accumulate(angle, axis=1)
    visible = angle >= running - 1e-9
    snowy = visible & far[None, :] & (h >= SNOWLINE)
    snow_low = np.where(snowy, angle, np.inf).min(axis=1)

    summit_angle = far_sky.max()
    scale = (VIEW_W / FOV) * EXAGGERATION  # units per degree, vertically
    top = 6.0  # leave headroom above the summit
    horizon = top + summit_angle * scale

    def y(a):
        return horizon - a * scale

    xs = (bearings - left) / FOV * VIEW_W
    view_h = math.ceil(y(min(near_sky.min(), mid_sky.min())) + 4)

    def layer(sky):
        return path([(0, view_h)] + [(x, y(a)) for x, a in zip(xs, sky)] + [(VIEW_W, view_h)])

    # Snowfield polygons over contiguous runs where snow is visible above the foothills.
    snow_paths = []
    has = np.isfinite(snow_low) & (far_sky > front_sky)
    i = 0
    while i < len(xs):
        if not has[i]:
            i += 1
            continue
        j = i
        while j + 1 < len(xs) and has[j + 1]:
            j += 1
        if j - i >= 3:
            low = np.maximum(snow_low[i : j + 1], front_sky[i : j + 1])
            top_pts = [(xs[k], y(far_sky[k])) for k in range(i, j + 1)]
            bottom_pts = [(xs[k], y(low[k - i])) for k in range(j, i - 1, -1)]
            snow_paths.append(path(top_pts + bottom_pts))
        i = j + 1

    with open(OUT, "w") as f:
        f.write(
            "// Generated by scripts/gen-skyline.py: Mount Rainier from Kerry Park, Seattle,\n"
            "// ray-cast over AWS Terrain Tiles (USGS 3DEP). Vertical scale exaggerated "
            f"{EXAGGERATION}x.\n\n"
            f"export const SKYLINE_SIZE = [{VIEW_W * SCALE:.0f}, {view_h * SCALE}] as const;\n\n"
            f"export const RAINIER = \"{layer(far_sky)}\";\n\n"
            f"export const RAINIER_SNOW = \"{''.join(snow_paths)}\";\n\n"
            f"export const FOOTHILLS = \"{layer(mid_sky)}\";\n\n"
            f"export const SEATTLE_HILLS = \"{layer(near_sky)}\";\n"
        )
    print(
        f"bearing {az0:.2f}°, summit {summit_angle:.2f}° above horizon, "
        f"eye {eye:.0f} m, tiles {(tx1 - tx0 + 1) * (ty1 - ty0 + 1)}, horizon y {horizon:.1f}, height {view_h}"
    )


if __name__ == "__main__":
    main()
