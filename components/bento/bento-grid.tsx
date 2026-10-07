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

import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
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
  /** Grid span classes, e.g. "col-span-2 row-span-2". */
  className: string;
  label: string;
  content: ReactNode;
  /** Skip the entrance animation (keep it off the LCP card). */
  still?: boolean;
};

type Drag = {
  id: string;
  el: HTMLElement;
  startX: number;
  startY: number;
  grabX: number;
  grabY: number;
  x: number;
  y: number;
  active: boolean;
  lastSwap: number;
};

// Pointer-downs on these never start a card drag.
const INTERACTIVE =
  "a,button,input,textarea,select,label,canvas,[data-nodrag],[contenteditable=true]";

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

  const wrapRef = useRef<HTMLDivElement>(null);
  const nodes = useRef(new Map<string, HTMLElement>());
  const before = useRef<Map<string, DOMRect> | null>(null);
  const drag = useRef<Drag | null>(null);
  const displayRef = useRef(display);
  const pointer = useRef({ x: 0, y: 0, frame: 0 });

  useLayoutEffect(() => {
    displayRef.current = display;
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

  const glueDragged = (d: Drag) => {
    d.el.style.transform = "none";
    const home = d.el.getBoundingClientRect();

    d.el.style.transform = `translate(${d.x - d.grabX - home.left}px, ${d.y - d.grabY - home.top}px)`;
  };

  useLayoutEffect(() => {
    const first = before.current;

    before.current = null;
    if (!first) return;
    const s = spring(180, 22);

    nodes.current.forEach((el, id) => {
      if (drag.current?.id === id) return;
      const a = first.get(id);

      if (!a) return;
      el.getAnimations().forEach((anim) => anim.id === "flip" && anim.cancel());
      const b = el.getBoundingClientRect();
      const dx = a.left - b.left;
      const dy = a.top - b.top;

      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      const anim = el.animate(
        [{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }],
        {
          duration: s.duration,
          easing: s.easing,
        },
      );

      anim.id = "flip";
    });
    if (drag.current?.active) glueDragged(drag.current);
  }, [display]);

  /* ---------- Drag to rearrange (mouse and pen) ---------- */

  const onMove = useCallback(
    (e: PointerEvent) => {
      const d = drag.current;

      if (!d) return;
      d.x = e.clientX;
      d.y = e.clientY;
      if (!d.active) {
        if (Math.hypot(d.x - d.startX, d.y - d.startY) < 7) return;
        d.active = true;
        d.el.setAttribute("data-dragging", "true");
        d.el.getAnimations().forEach((a) => a.cancel());
        document.documentElement.style.userSelect = "none";
        window.getSelection()?.removeAllRanges();
      }
      glueDragged(d);

      const now = performance.now();

      if (now - d.lastSwap < 240) return;
      let target: string | null = null;

      nodes.current.forEach((node, id) => {
        if (target || id === d.id) return;
        const r = node.getBoundingClientRect();
        const ix = Math.min(r.width * 0.22, 60);
        const iy = Math.min(r.height * 0.22, 60);

        if (
          d.x > r.left + ix &&
          d.x < r.right - ix &&
          d.y > r.top + iy &&
          d.y < r.bottom - iy
        ) {
          target = id;
        }
      });
      if (!target) return;
      const to = target as string;

      d.lastSwap = now;
      before.current = snapshot();
      setOrder(() => {
        // The dragged card takes the target's slot; everything between shifts by one.
        const current = displayRef.current;
        const next = current.filter((x) => x !== d.id);

        next.splice(current.indexOf(to), 0, d.id);

        return next;
      });
    },
    [snapshot],
  );

  const onUp = useCallback(() => {
    const d = drag.current;

    drag.current = null;
    window.removeEventListener("pointermove", onMove);
    if (!d?.active) return;
    document.documentElement.style.userSelect = "";
    const from = d.el.style.transform;

    d.el.style.transform = "";
    d.el.removeAttribute("data-dragging");
    const s = spring(240, 22);

    d.el.animate([{ transform: from }, { transform: "none" }], {
      duration: s.duration,
      easing: s.easing,
    });
    // Swallow the click that follows the drag.
    const stop = (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
    };

    window.addEventListener("click", stop, { capture: true, once: true });
    window.setTimeout(
      () => window.removeEventListener("click", stop, { capture: true }),
      0,
    );
  }, [onMove]);

  const startDrag = (id: string) => (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType === "touch" || e.button !== 0) return;
    if ((e.target as Element).closest(INTERACTIVE)) return;
    const el = nodes.current.get(id);

    if (!el) return;
    const r = el.getBoundingClientRect();

    drag.current = {
      id,
      el,
      startX: e.clientX,
      startY: e.clientY,
      grabX: e.clientX - r.left,
      grabY: e.clientY - r.top,
      x: e.clientX,
      y: e.clientY,
      active: false,
      lastSwap: 0,
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    window.addEventListener("pointercancel", onUp, { once: true });
  };

  useEffect(
    () => () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    },
    [onMove, onUp],
  );

  /* ---------- Spotlight + tilt: one listener for the whole grid ---------- */

  const paintSpot = () => {
    pointer.current.frame = 0;
    const { x, y } = pointer.current;
    const entries: [HTMLElement, DOMRect][] = [];

    nodes.current.forEach((el) =>
      entries.push([el, el.getBoundingClientRect()]),
    );
    for (const [el, r] of entries) {
      el.style.setProperty("--mx", `${(x - r.left).toFixed(0)}px`);
      el.style.setProperty("--my", `${(y - r.top).toFixed(0)}px`);
      const inside = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;

      el.style.setProperty(
        "--tx",
        inside ? (((x - r.left) / r.width) * 2 - 1).toFixed(3) : "0",
      );
      el.style.setProperty(
        "--ty",
        inside ? (((y - r.top) / r.height) * 2 - 1).toFixed(3) : "0",
      );
    }
  };

  const onGridMove = (e: ReactPointerEvent) => {
    if (e.pointerType === "touch") return;
    pointer.current.x = e.clientX;
    pointer.current.y = e.clientY;
    wrapRef.current?.style.setProperty("--spot", "1");
    if (!pointer.current.frame)
      pointer.current.frame = requestAnimationFrame(paintSpot);
  };

  const onGridLeave = () => {
    wrapRef.current?.style.setProperty("--spot", "0");
    nodes.current.forEach((el) => {
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
      <ul className="bento">
        {display.map((id) => {
          const item = byId.get(id);

          if (!item) return null;
          const dim = view !== "all" && !item.tags.includes(view);

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
              className={cn("card", item.className)}
              data-card={id}
              data-dim={dim ? "true" : undefined}
              data-enter={item.still ? undefined : ""}
              id={`card-${id}`}
              style={{ "--i": item.n } as CSSProperties}
              onPointerDown={startDrag(id)}
            >
              {item.content}
              <span aria-hidden className="card-rim" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
