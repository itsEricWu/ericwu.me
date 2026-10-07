"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import {
  pack,
  placeAt,
  readingOrder,
  sameLayout,
  tierFor,
  TIERS,
  type Cell,
  type Size,
} from "@/lib/bento-layout";
import { springs } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/utils";
import {
  isView,
  onBeforeViewChange,
  setView,
  useView,
  type View,
} from "@/lib/view-store";

export type BentoItem = {
  id: string;
  tags: View[];
  /** Columns × rows in each layout tier (TIERS): phones, small tablets, tablets, desktops. */
  size: readonly [Size, Size, Size, Size];
  label: string;
  content: ReactNode;
  /** Skip the entrance animation (keep it off the LCP card). */
  still?: boolean;
};

type Drag = {
  id: string;
  el: HTMLElement;
  touch: boolean;
  startX: number;
  startY: number;
  /** Where the card was grabbed, relative to its top-left corner. */
  grabX: number;
  grabY: number;
  /** Latest pointer position (client coordinates). */
  x: number;
  y: number;
  active: boolean;
  frame: number;
  hold: number;
  /** Layout tier and grid metrics, fixed for the life of the drag. */
  tier: number;
  cols: number;
  /** The cell the card was last placed in. */
  cell: { x: number; y: number } | null;
  /** Reading order when the drag began: the others always re-pack in this order. */
  base: string[];
};

// Pointer-downs on these never start a card drag.
const INTERACTIVE =
  "a,button,input,textarea,select,label,canvas,[data-nodrag],[contenteditable=true]";
/** Press and hold this long before a touch drag starts (quicker moves scroll). */
const HOLD_MS = 380;
/** Holding a card this close to the top or bottom of the viewport scrolls. */
const EDGE = 72;
/** The spotlight and rim light reach this far from the cursor. */
const LIGHT_REACH = 280;

/** A card's slot in the grid: layout only, untouched by transforms or animations. */
const slotOf = (el: HTMLElement) => ({
  left: el.offsetLeft,
  top: el.offsetTop,
  width: el.offsetWidth,
  height: el.offsetHeight,
});

/** Keep the dragged card under the pointer, wherever its slot is now. */
function glue(grid: HTMLElement, d: Drag) {
  const g = grid.getBoundingClientRect();
  const s = slotOf(d.el);

  d.el.style.transform = `translate3d(${d.x - g.left - d.grabX - s.left}px, ${d.y - g.top - d.grabY - s.top}px, 0)`;
}

export function BentoGrid({ items }: { items: BentoItem[] }) {
  const view = useView();
  const [order, setOrder] = useState(() => items.map((i) => i.id));
  const byId = useMemo(
    () => new Map(items.map((i, n) => [i.id, { ...i, n }])),
    [items],
  );
  const display = useMemo(() => {
    if (view === "all") return order;
    const hit = (id: string) => byId.get(id)?.tags.includes(view);

    return [...order.filter(hit), ...order.filter((id) => !hit(id))];
  }, [order, view, byId]);
  // Layouts the visitor arranged by dragging, per view and tier.
  const [custom, setCustom] = useState<Record<string, Cell[]>>({});
  const [ghost, setGhost] = useState<Cell | null>(null);
  const layouts = useMemo(
    () =>
      TIERS.map(
        (t, i) =>
          custom[`${view}:${i}`] ??
          pack(display, (id) => byId.get(id)?.size[i] ?? [1, 1], t.cols),
      ),
    [custom, display, view, byId],
  );

  const wrapRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const nodes = useRef(new Map<string, HTMLElement>());
  const before = useRef<Map<string, DOMRect> | null>(null);
  const drag = useRef<Drag | null>(null);
  const layoutsRef = useRef(layouts);
  const byIdRef = useRef(byId);
  const viewRef = useRef(view);
  const pointer = useRef({
    x: 0,
    y: 0,
    frame: 0,
    lit: new Set<HTMLElement>(),
  });

  useLayoutEffect(() => {
    layoutsRef.current = layouts;
    byIdRef.current = byId;
    viewRef.current = view;
  });

  const snapshot = useCallback(() => {
    const m = new Map<string, DOMRect>();

    nodes.current.forEach((el, id) => m.set(id, el.getBoundingClientRect()));

    return m;
  }, []);

  // Measure before the view changes so cards can glide (FLIP) to their new slots.
  useEffect(
    () =>
      onBeforeViewChange(() => {
        before.current = snapshot();
      }),
    [snapshot],
  );

  useEffect(() => {
    const fromHash = () => {
      const hash = window.location.hash.slice(1);

      setView(isView(hash) ? hash : "all", { updateUrl: false });
    };

    fromHash();
    window.addEventListener("hashchange", fromHash);

    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  // FLIP: every card that changed slots glides from where it was.
  useLayoutEffect(() => {
    const first = before.current;

    before.current = null;
    if (!first) return;
    const s = springs.glide();
    const still = prefersReducedMotion();
    const d = drag.current?.active ? drag.current : null;

    nodes.current.forEach((el, id) => {
      if (d?.id === id) return;
      const a = first.get(id);

      if (!a) return;
      el.getAnimations().forEach((anim) => anim.id === "flip" && anim.cancel());
      if (still) return;
      const b = el.getBoundingClientRect();
      const dx = a.left - b.left;
      const dy = a.top - b.top;

      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      const anim = el.animate(
        [{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }],
        { duration: s.duration, easing: s.easing },
      );

      anim.id = "flip";
    });
    if (d && gridRef.current) glue(gridRef.current, d);
  }, [layouts]);

  /* ---------- Drag to rearrange: mouse, pen, or long-press on touch ---------- */

  useEffect(() => {
    const grid = gridRef.current;

    if (!grid) return;

    const frame = () => {
      const d = drag.current;

      if (!d?.active) return;
      d.frame = 0;
      // Scroll while the card is held near the top or bottom of the viewport.
      const near =
        d.y < EDGE
          ? d.y - EDGE
          : d.y > innerHeight - EDGE
            ? d.y - (innerHeight - EDGE)
            : 0;

      if (near) {
        window.scrollBy(
          0,
          Math.sign(near) * Math.min(22, (near / EDGE) ** 2 * 22),
        );
      }
      glue(grid, d);

      // Snap the card's top-left corner to the nearest cell.
      const layout = layoutsRef.current[d.tier];
      const held = layout.find((c) => c.id === d.id);

      if (held) {
        const g = grid.getBoundingClientRect();
        const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
        const pitch = (g.width + gap) / d.cols;
        const x = Math.min(
          Math.max(Math.round((d.x - g.left - d.grabX) / pitch), 0),
          d.cols - held.w,
        );
        const y = Math.max(Math.round((d.y - g.top - d.grabY) / pitch), 0);

        if (!d.cell || d.cell.x !== x || d.cell.y !== y) {
          d.cell = { x, y };
          const next = placeAt(
            d.base,
            (id) => byIdRef.current.get(id)?.size[d.tier] ?? [1, 1],
            d.cols,
            d.id,
            x,
            y,
          );

          if (!sameLayout(next, layout)) {
            const key = `${viewRef.current}:${d.tier}`;

            before.current = snapshot();
            setCustom((c) => ({ ...c, [key]: next }));
            if (viewRef.current === "all") setOrder(readingOrder(next));
          }
          setGhost(next.find((c) => c.id === d.id) ?? null);
        }
      }
      if (near) d.frame = requestAnimationFrame(frame);
    };

    const activate = (d: Drag) => {
      d.active = true;
      d.el.removeAttribute("data-pressed");
      d.el.getAnimations().forEach((a) => a.cancel());
      const r = d.el.getBoundingClientRect();

      // Measure the grab point again now that any in-flight animation is gone.
      d.grabX = Math.min(Math.max(d.startX - r.left, 0), r.width);
      d.grabY = Math.min(Math.max(d.startY - r.top, 0), r.height);
      d.base = readingOrder(layoutsRef.current[d.tier]);
      d.el.setAttribute("data-dragging", "true");
      wrapRef.current?.setAttribute("data-dragging", "true");
      setGhost(layoutsRef.current[d.tier].find((c) => c.id === d.id) ?? null);
      document.documentElement.style.userSelect = "none";
      window.getSelection()?.removeAllRanges();
      if (d.touch) navigator.vibrate?.(8);
      glue(grid, d);
    };

    const onMove = (e: PointerEvent) => {
      const d = drag.current;

      if (!d) return;
      d.x = e.clientX;
      d.y = e.clientY;
      if (!d.active) {
        const moved = Math.hypot(d.x - d.startX, d.y - d.startY);

        // On touch a quick move is a scroll; with a mouse a small one starts the drag.
        if (d.touch) {
          if (moved > 10) end();
        } else if (moved > 6) {
          activate(d);
        }

        return;
      }
      if (!d.frame) d.frame = requestAnimationFrame(frame);
    };

    // Once a touch drag is live, the page must not scroll under the finger.
    const blockScroll = (e: TouchEvent) => {
      if (drag.current?.active) e.preventDefault();
    };
    const blockMenu = (e: Event) => {
      if (drag.current?.touch) e.preventDefault();
    };

    const end = () => {
      const d = drag.current;

      drag.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      window.removeEventListener("touchmove", blockScroll);
      window.removeEventListener("contextmenu", blockMenu);
      if (!d) return;
      window.clearTimeout(d.hold);
      cancelAnimationFrame(d.frame);
      d.el.removeAttribute("data-pressed");
      if (!d.active) return;
      document.documentElement.style.userSelect = "";
      wrapRef.current?.removeAttribute("data-dragging");
      setGhost(null);
      const from = d.el.style.transform;

      d.el.style.transform = "";
      d.el.removeAttribute("data-dragging");
      if (!prefersReducedMotion()) {
        const s = springs.glide();

        d.el.animate([{ transform: from }, { transform: "none" }], {
          duration: s.duration,
          easing: s.easing,
        });
      }
      // Swallow the click that follows a drag.
      const stop = (ev: MouseEvent) => {
        ev.stopPropagation();
        ev.preventDefault();
      };

      window.addEventListener("click", stop, { capture: true, once: true });
      window.setTimeout(
        () => window.removeEventListener("click", stop, { capture: true }),
        0,
      );
    };

    const onDown = (e: PointerEvent) => {
      if (drag.current || !e.isPrimary) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const target = e.target as Element;

      if (target.closest(INTERACTIVE)) return;
      const el = target.closest<HTMLElement>("[data-card]");

      if (!el || !grid.contains(el)) return;
      const r = el.getBoundingClientRect();
      const d: Drag = {
        id: el.dataset.card!,
        el,
        touch: e.pointerType === "touch",
        startX: e.clientX,
        startY: e.clientY,
        grabX: e.clientX - r.left,
        grabY: e.clientY - r.top,
        x: e.clientX,
        y: e.clientY,
        active: false,
        frame: 0,
        hold: 0,
        tier: tierFor(window.innerWidth),
        cols: 0,
        cell: null,
        base: [],
      };

      d.cols = TIERS[d.tier].cols;

      drag.current = d;
      el.setAttribute("data-pressed", "");
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
      if (d.touch) {
        window.addEventListener("touchmove", blockScroll, { passive: false });
        window.addEventListener("contextmenu", blockMenu);
        d.hold = window.setTimeout(() => {
          if (drag.current === d) activate(d);
        }, HOLD_MS);
      }
    };

    grid.addEventListener("pointerdown", onDown);

    return () => {
      grid.removeEventListener("pointerdown", onDown);
      end();
    };
  }, [snapshot]);

  /* ---------- Spotlight + tilt: one listener, only the cards near the cursor ---------- */

  const paintSpot = () => {
    const p = pointer.current;

    p.frame = 0;
    if (drag.current?.active) return;
    const lit = new Set<HTMLElement>();

    nodes.current.forEach((el) => {
      const r = el.getBoundingClientRect();
      const dx = Math.max(r.left - p.x, 0, p.x - r.right);
      const dy = Math.max(r.top - p.y, 0, p.y - r.bottom);

      if (Math.hypot(dx, dy) > LIGHT_REACH) return;
      lit.add(el);
      el.style.setProperty("--mx", `${(p.x - r.left).toFixed(0)}px`);
      el.style.setProperty("--my", `${(p.y - r.top).toFixed(0)}px`);
      const inside = dx === 0 && dy === 0;

      el.style.setProperty(
        "--tx",
        inside ? (((p.x - r.left) / r.width) * 2 - 1).toFixed(3) : "0",
      );
      el.style.setProperty(
        "--ty",
        inside ? (((p.y - r.top) / r.height) * 2 - 1).toFixed(3) : "0",
      );
    });
    // Cards the light just left go dark once, instead of repainting every frame.
    p.lit.forEach((el) => {
      if (lit.has(el)) return;
      el.style.setProperty("--mx", "-999px");
      el.style.setProperty("--my", "-999px");
      el.style.setProperty("--tx", "0");
      el.style.setProperty("--ty", "0");
    });
    p.lit = lit;
  };

  const onGridMove = (e: ReactPointerEvent) => {
    if (e.pointerType === "touch") return;
    const p = pointer.current;

    p.x = e.clientX;
    p.y = e.clientY;
    wrapRef.current?.style.setProperty("--spot", "1");
    if (!p.frame) p.frame = requestAnimationFrame(paintSpot);
  };

  const onGridLeave = () => {
    const p = pointer.current;

    cancelAnimationFrame(p.frame);
    p.frame = 0;
    wrapRef.current?.style.setProperty("--spot", "0");
    p.lit.forEach((el) => {
      el.style.setProperty("--tx", "0");
      el.style.setProperty("--ty", "0");
    });
  };

  return (
    <div
      ref={wrapRef}
      className="bento-wrap"
      onPointerLeave={onGridLeave}
      onPointerMove={onGridMove}
    >
      <ul ref={gridRef} className="bento">
        {/* DOM order never changes (moving nodes would restart their animations
            and reload iframes); each card's cell comes from the layout. */}
        {items.map(({ id }) => {
          const item = byId.get(id);

          if (!item) return null;
          const dim = view !== "all" && !item.tags.includes(view);
          const place: Record<string, number> = { "--i": item.n };

          layouts.forEach((layout, t) => {
            const c = layout.find((cell) => cell.id === id);

            if (!c) return;
            place[`--c${t}`] = c.x + 1;
            place[`--r${t}`] = c.y + 1;
            place[`--w${t}`] = c.w;
            place[`--h${t}`] = c.h;
          });

          return (
            <li
              key={id}
              ref={(el) => {
                if (!el) return;
                nodes.current.set(id, el);

                return () => {
                  nodes.current.delete(id);
                };
              }}
              aria-label={item.label}
              className="card"
              data-card={id}
              data-dim={dim ? "true" : undefined}
              data-enter={item.still ? undefined : ""}
              id={`card-${id}`}
              style={place as CSSProperties}
            >
              <div className="card-body">{item.content}</div>
              <span aria-hidden className="card-rim" />
            </li>
          );
        })}
        {ghost && (
          <li
            aria-hidden
            className="bento-ghost"
            style={{
              gridColumn: `${ghost.x + 1} / span ${ghost.w}`,
              gridRow: `${ghost.y + 1} / span ${ghost.h}`,
            }}
          />
        )}
      </ul>
    </div>
  );
}
