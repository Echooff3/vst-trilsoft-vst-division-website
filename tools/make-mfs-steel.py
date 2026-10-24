#!/usr/bin/env python3
"""MIDI Fart Sniffer's galvanized trash-can steel, for the site.

A numpy port of `can()` in midi-fart-sniffer/src/theme.rs (same hash, same
spangle cells, ribs, vignette, grime and rust), so the rebuilt window on
the site sits on the plug-in's own metal. Writes:

  public/assets/mfs-can.webp    the window's 1180x760 panel, drawn at 2x
  public/assets/mfs-steel.webp  a seamless tile of bare spangle for page backgrounds

  python3 tools/make-mfs-steel.py      (needs numpy and Pillow)
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
W, H = 1180, 760
CELL = 30.0
RIBS = ((22.0, 9.0, 0.30), (336.0, 15.0, 0.16), (566.0, 15.0, 0.16))
BASE = np.array([0xA6, 0xB0, 0xB8], dtype=np.float64)
TINT = np.array([0x8A, 0x52, 0x2A], dtype=np.float64)

np.seterr(over="ignore")


def hash01(x, y, salt):
    x = np.asarray(x, dtype=np.int64).astype(np.uint64)
    y = np.asarray(y, dtype=np.int64).astype(np.uint64)
    h = (x * np.uint64(0x9E3779B97F4A7C15)) ^ (y * np.uint64(0xC2B2AE3D27D4EB4F)) ^ np.uint64((salt * 0x165667B19E3779F9) % (1 << 64))
    h ^= h >> np.uint64(31)
    h = h * np.uint64(0xBF58476D1CE4E5B9)
    h ^= h >> np.uint64(29)
    return (h >> np.uint64(11)).astype(np.float64) / float(1 << 53)


def value_noise(x, y, salt):
    x0, y0 = np.floor(x), np.floor(y)
    s = lambda t: t * t * (3 - 2 * t)
    sx, sy = s(x - x0), s(y - y0)
    xi, yi = x0.astype(np.int64), y0.astype(np.int64)
    a = hash01(xi, yi, salt) + (hash01(xi + 1, yi, salt) - hash01(xi, yi, salt)) * sx
    b = hash01(xi, yi + 1, salt) + (hash01(xi + 1, yi + 1, salt) - hash01(xi, yi + 1, salt)) * sx
    return a + (b - a) * sy


def spangle(fx, fy, wrap=None):
    """Shine and grain of the zinc spangle the point falls in. With `wrap`
    (cells across and down) the cells repeat, for a seamless tile."""
    cx, cy = np.floor(fx / CELL).astype(np.int64), np.floor(fy / CELL).astype(np.int64)
    best = np.full(fx.shape, np.inf)
    bx, by = np.zeros(fx.shape, np.int64), np.zeros(fx.shape, np.int64)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            gx, gy = cx + dx, cy + dy
            hx, hy = (gx % wrap[0], gy % wrap[1]) if wrap else (gx, gy)
            px = (gx + hash01(hx, hy, 11)) * CELL
            py = (gy + hash01(hx, hy, 12)) * CELL
            d = (fx - px) ** 2 + (fy - py) ** 2
            m = d < best
            best = np.where(m, d, best)
            bx, by = np.where(m, hx, bx), np.where(m, hy, by)
    shine = (hash01(bx, by, 13) - 0.5) * 0.12
    a = hash01(bx, by, 14) * np.pi
    grain = np.sin(fx * np.cos(a) + fy * np.sin(a)) * 0.012
    return 1.0 + shine + grain


def colour(light, rust):
    c = (BASE * light[..., None]) * (1 - rust[..., None]) + TINT * light[..., None] * rust[..., None]
    return np.clip(c, 0, 255).astype(np.uint8)


def can(scale=2):
    ys, xs = np.mgrid[0 : H * scale, 0 : W * scale].astype(np.float64)
    fx, fy = (xs + 0.5) / scale, (ys + 0.5) / scale
    light = spangle(fx, fy) + (hash01(np.floor(fx).astype(np.int64), np.floor(fy).astype(np.int64), 15) - 0.5) * 0.03
    for at, half, depth in RIBS:
        t = (fy - at) / half
        light -= np.where(np.abs(t) < 1, depth * 2.6 * t * (1 - t * t), 0)
    ux, uy = fx / W - 0.5, fy / H - 0.45
    light *= 1 - 0.55 * (ux * ux + uy * uy) ** 1.2
    grime = np.maximum(value_noise(fx / 90, fy / 70, 16) * (0.4 + 0.8 * fy / H) - 0.55, 0) * 0.5
    light *= 1 - grime
    rust = np.minimum(np.maximum(value_noise(fx / 9, fy / 9, 17) * value_noise(fx / 120, fy / 120, 18) - 0.5, 0) * 2.2, 0.4)
    return Image.fromarray(colour(light, rust), "RGB")


def tile(cells=16, scale=2):
    n = int(cells * CELL)
    ys, xs = np.mgrid[0 : n * scale, 0 : n * scale].astype(np.float64)
    fx, fy = (xs + 0.5) / scale, (ys + 0.5) / scale
    light = spangle(fx, fy, wrap=(cells, cells)) + (hash01(xs.astype(np.int64), ys.astype(np.int64), 15) - 0.5) * 0.03
    return Image.fromarray(colour(light, np.zeros_like(light)), "RGB")


def main():
    out = ROOT / "public" / "assets"
    can().save(out / "mfs-can.webp", quality=82, method=6)
    tile().save(out / "mfs-steel.webp", quality=80, method=6)
    for name in ("mfs-can.webp", "mfs-steel.webp"):
        print(f"Wrote public/assets/{name} ({(out / name).stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
