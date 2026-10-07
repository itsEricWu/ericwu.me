/**
 * Layout for the bento grid, in grid cells.
 *
 * The first layout packs cards in order exactly like CSS
 * `grid-auto-flow: row dense` (first fit from the top-left), so the server can
 * render it. While a card is dragged, it claims the cell under it and every
 * other card re-packs tightly around it in the order they had when the drag
 * began, like icons and widgets on a phone's home screen. The result depends
 * only on where the card is held, so the grid never oscillates, and there are
 * no holes left behind.
 */

export type Size = readonly [w: number, h: number];
export type Cell = { id: string; x: number; y: number; w: number; h: number };

/**
 * Layout tiers: columns, and the viewport width where each starts. Cells stay
 * between ~230px and ~350px from small tablets up, the range the cards' larger
 * type is drawn for; phones get their own sizes (wide phones a square hero).
 */
export const TIERS = [
  { cols: 2, min: 0 },
  { cols: 2, min: 480 },
  { cols: 2, min: 640 },
  { cols: 3, min: 768 },
  { cols: 4, min: 1024 },
] as const;

export const tierFor = (width: number) => {
  let tier = 0;

  TIERS.forEach((t, i) => {
    if (width >= t.min) tier = i;
  });

  return tier;
};

/** First fit from the top-left, in order (what CSS `row dense` does). */
export function pack(
  ids: readonly string[],
  sizeOf: (id: string) => Size,
  cols: number,
): Cell[] {
  const taken: boolean[][] = [];
  const fits = (x: number, y: number, w: number, h: number) => {
    for (let r = y; r < y + h; r++) {
      for (let c = x; c < x + w; c++) if (taken[r]?.[c]) return false;
    }

    return true;
  };

  return ids.map((id) => {
    const [sw, h] = sizeOf(id);
    const w = Math.min(sw, cols);

    for (let y = 0; ; y++) {
      for (let x = 0; x + w <= cols; x++) {
        if (!fits(x, y, w, h)) continue;
        for (let r = y; r < y + h; r++) {
          taken[r] ??= [];
          for (let c = x; c < x + w; c++) taken[r][c] = true;
        }

        return { id, x, y, w, h };
      }
    }
  });
}

/**
 * Hold card `id` at (x, y) and pack every other card around it, first fit in
 * `order`. If nothing is above the held card, it floats up to meet the rest.
 */
export function placeAt(
  order: readonly string[],
  sizeOf: (id: string) => Size,
  cols: number,
  id: string,
  x: number,
  y: number,
): Cell[] {
  const [sw, h] = sizeOf(id);
  const w = Math.min(sw, cols);
  const taken: boolean[][] = [];
  const mark = (c: Cell, value: boolean) => {
    for (let r = c.y; r < c.y + c.h; r++) {
      taken[r] ??= [];
      for (let col = c.x; col < c.x + c.w; col++) taken[r][col] = value;
    }
  };
  const fits = (cx: number, cy: number, cw: number, ch: number) => {
    for (let r = cy; r < cy + ch; r++) {
      for (let col = cx; col < cx + cw; col++)
        if (taken[r]?.[col]) return false;
    }

    return true;
  };
  const held: Cell = { id, x: Math.min(Math.max(x, 0), cols - w), y, w, h };

  mark(held, true);
  const others = order
    .filter((o) => o !== id)
    .map((o) => {
      const [ow0, oh] = sizeOf(o);
      const ow = Math.min(ow0, cols);

      for (let cy = 0; ; cy++) {
        for (let cx = 0; cx + ow <= cols; cx++) {
          if (!fits(cx, cy, ow, oh)) continue;
          const cell = { id: o, x: cx, y: cy, w: ow, h: oh };

          mark(cell, true);

          return cell;
        }
      }
    });

  // Don't leave the held card hanging below empty space.
  mark(held, false);
  while (held.y > 0 && fits(held.x, held.y - 1, w, 1)) held.y--;

  return [held, ...others];
}

export const sameLayout = (a: Cell[], b: Cell[]) =>
  a.length === b.length &&
  a.every((c) => {
    const d = b.find((x) => x.id === c.id);

    return d && d.x === c.x && d.y === c.y;
  });

/** Reading order of a layout: top to bottom, left to right. */
export const readingOrder = (cells: Cell[]) =>
  [...cells].sort((a, b) => a.y - b.y || a.x - b.x).map((c) => c.id);
