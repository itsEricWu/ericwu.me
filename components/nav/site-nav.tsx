"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";

import { LiquidGlass, useGlassLight } from "@/components/glass/liquid-glass";
import { useLocale, useT } from "@/components/locale-provider";
import { useShortcut } from "@/components/nav/shortcut";
import { htmlLang, localePath, stripLocale, type Locale } from "@/lib/i18n";
import { springs } from "@/lib/motion";
import { switchTheme } from "@/lib/theme-transition";
import { cn } from "@/lib/utils";
import { setView, useView, type View } from "@/lib/view-store";

const CommandPalette = dynamic(() => import("./command-palette"), {
  ssr: false,
});

type TabId = View | "blog";

// In order; the labels live in messages/ (nav.tabs).
const TABS: TabId[] = ["all", "about", "work", "blog"];

export function SiteNav() {
  const lang = useLocale();
  const t = useT();
  // The path without its language, so both languages share the logic below.
  const pathname = stripLocale(usePathname());
  const router = useRouter();
  const view = useView();
  const onHome = pathname === "/";
  const activeId = pathname.startsWith("/blog") ? "blog" : onHome ? view : null;
  const activeIndex = TABS.findIndex((id) => id === activeId);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const shortcut = useShortcut();

  const select = useCallback(
    (id: TabId) => {
      if (id === "blog") {
        if (pathname !== "/blog") router.push(localePath(lang, "/blog"));

        return;
      }
      if (onHome) {
        setView(id);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setView(id, { updateUrl: false });
        const home = localePath(lang, "/");

        router.push(id === "all" ? home : `${home}#${id}`);
      }
    },
    [lang, onHome, pathname, router],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName));

      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 bottom-[max(14px,env(safe-area-inset-bottom))] z-50 flex justify-center px-3 sm:top-4 sm:bottom-auto">
        <LiquidGlass
          data-steady-light
          className="pointer-events-auto flex items-center gap-1 rounded-full p-1.5 [--glass-tint:rgb(255_255_255/0.5)] dark:[--glass-tint:rgb(16_20_26/0.55)]"
          glass={{ chroma: 0.1, blur: 3, saturate: 1.8 }}
        >
          <Tabs
            activeIndex={activeIndex}
            labels={TABS.map((id) => t.nav.tabs[id])}
            sections={t.nav.sections}
            onSelect={select}
          />
          <SearchButton
            label={t.nav.search}
            shortcut={shortcut}
            onOpen={() => setPaletteOpen(true)}
          />
          <LanguageButton lang={lang} path={pathname} />
          <ThemeButton />
        </LiquidGlass>
      </header>
      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          onSelectTab={select}
        />
      )}
    </>
  );
}

function Tabs({
  activeIndex,
  labels,
  sections,
  onSelect,
}: {
  activeIndex: number;
  labels: string[];
  sections: string;
  onSelect: (id: TabId) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const prevIndex = useRef(activeIndex);
  const drag = useRef<{
    startX: number;
    lastX: number;
    lastT: number;
    v: number;
    moved: boolean;
  } | null>(null);
  // Nested backdrop filters are unreliable in Chromium, so the pill sits behind
  // the labels as lit glass; only the bar itself refracts the page.
  const dropletRef = useRef<HTMLSpanElement>(null);

  useGlassLight(dropletRef);

  // Liquid hop between tabs: stretch along the path, squash, then settle with a spring.
  useEffect(() => {
    const el = dropletRef.current;
    const from = prevIndex.current;

    prevIndex.current = activeIndex;
    if (!el || activeIndex < 0) return;
    el.style.transform = `translateX(${activeIndex * 100}%)`;
    el.style.opacity = "1";
    if (from < 0 || from === activeIndex) return;

    const dist = Math.abs(activeIndex - from);
    const stretch = 1 + Math.min(0.55, dist * 0.22);
    const s = springs.wobble();

    el.animate(
      [
        { transform: `translateX(${from * 100}%) scale(1, 1)` },
        {
          transform: `translateX(${((from + activeIndex) / 2) * 100}%) scale(${stretch}, ${2 - stretch})`,
          offset: 0.45,
        },
        { transform: `translateX(${activeIndex * 100}%) scale(1, 1)` },
      ],
      { duration: Math.max(420, s.duration), easing: s.easing },
    );
  }, [activeIndex]);

  const indexAt = (clientX: number) => {
    const list = listRef.current;

    if (!list) return activeIndex;
    const r = list.getBoundingClientRect();
    const w = r.width / TABS.length;

    return Math.max(
      0,
      Math.min(TABS.length - 1, Math.floor((clientX - r.left) / w)),
    );
  };

  // Press and drag the droplet across the bar, like the iOS 26 tab bar.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    drag.current = {
      startX: e.clientX,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
      moved: false,
    };
    dropletRef.current?.style.setProperty("--press", "1");
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = dropletRef.current;
    const list = listRef.current;

    if (!d || !el || !list) return;
    if (!d.moved && Math.abs(e.clientX - d.startX) < 6) return;
    if (!d.moved) {
      d.moved = true;
      list.setPointerCapture(e.pointerId);
      el.getAnimations().forEach((a) => a.cancel());
    }
    const now = performance.now();

    d.v =
      0.8 * d.v + 0.2 * ((e.clientX - d.lastX) / Math.max(1, now - d.lastT));
    d.lastX = e.clientX;
    d.lastT = now;
    const r = list.getBoundingClientRect();
    const w = r.width / TABS.length;
    const x = Math.max(0, Math.min(r.width - w, e.clientX - r.left - w / 2));
    const stretch = 1 + Math.min(0.45, Math.abs(d.v) * 0.18);

    el.style.opacity = "1";
    el.style.transform = `translateX(${(x / w) * 100}%) scale(${stretch * 1.06}, ${(2 - stretch) * 1.06})`;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;

    drag.current = null;
    dropletRef.current?.style.removeProperty("--press");
    if (!d?.moved) return;
    const index = indexAt(e.clientX);
    const el = dropletRef.current;

    if (el) {
      const current = el.style.transform;
      const s = springs.wobble();

      el.style.transform = `translateX(${index * 100}%)`;
      el.animate([{ transform: current }, { transform: el.style.transform }], {
        duration: s.duration,
        easing: s.easing,
      });
    }
    prevIndex.current = index;
    onSelect(TABS[index]);
  };

  return (
    <div
      ref={listRef}
      aria-label={sections}
      className="relative flex touch-pan-y select-none"
      role="tablist"
      onPointerCancel={onPointerUp}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {TABS.map((tab, i) => (
        <button
          key={tab}
          aria-selected={i === activeIndex}
          className={cn(
            "relative z-10 h-10 w-[58px] rounded-full text-[13px] font-medium transition-[color,scale] duration-300 sm:w-[76px] sm:text-[14px]",
            i === activeIndex
              ? "scale-[1.06] text-ink"
              : "text-muted hover:text-ink",
          )}
          role="tab"
          type="button"
          onClick={() => {
            if (drag.current?.moved) return;
            onSelect(tab);
          }}
        >
          {labels[i]}
        </button>
      ))}
      <span
        ref={dropletRef}
        aria-hidden
        className="lg pointer-events-none absolute inset-y-0 left-0 z-0 w-[58px] rounded-full shadow-[0_6px_16px_-8px_rgb(40_20_30/0.35)] [--glass-tint:rgb(255_255_255/0.75)] transition-[scale] duration-300 [--lg-blur:0px] [backdrop-filter:none] [scale:calc(1+var(--press,0)*0.12)] sm:w-[76px] dark:[--glass-tint:rgb(255_255_255/0.12)]"
        style={{
          transform: `translateX(${Math.max(0, activeIndex) * 100}%)`,
          opacity: activeIndex < 0 ? 0 : 1,
        }}
      >
        <span className="lg-caustic" />
      </span>
    </div>
  );
}

/** Opens the command palette; its shortcut lives in the hover label and the footer. */
function SearchButton({
  label,
  shortcut,
  onOpen,
}: {
  label: string;
  shortcut: string;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useGlassLight(ref);

  return (
    <button
      ref={ref}
      aria-keyshortcuts="Meta+K Control+K"
      aria-label={label}
      className="lg hidden size-10 place-items-center rounded-full md:grid"
      data-cursor={`${label} ${shortcut}`}
      type="button"
      onClick={onOpen}
    >
      <span className="lg-caustic" />
      <svg
        aria-hidden
        className="size-[17px]"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 4.5 4.5" />
      </svg>
    </button>
  );
}

/** Opens this page in the other language; its label is written in that language. */
function LanguageButton({ lang, path }: { lang: Locale; path: string }) {
  const { nav } = useT();
  const ref = useRef<HTMLAnchorElement>(null);
  const other: Locale = lang === "en" ? "zh" : "en";

  useGlassLight(ref);

  return (
    <a
      ref={ref}
      aria-label={nav.switchLabel}
      className="lg grid size-10 place-items-center rounded-full text-[13px] font-semibold max-[340px]:hidden"
      data-cursor={nav.switchCursor}
      href={localePath(other, path)}
      hrefLang={htmlLang[other]}
      lang={htmlLang[other]}
      onClick={(e) => {
        // Keep the home grid's view (its hash) across the switch.
        e.currentTarget.href = localePath(other, path) + window.location.hash;
      }}
    >
      <span aria-hidden className="lg-caustic" />
      <span aria-hidden>{nav.switchShort}</span>
    </a>
  );
}

function ThemeButton() {
  const { nav } = useT();
  const { resolvedTheme, setTheme } = useTheme();
  const ref = useRef<HTMLButtonElement>(null);

  useGlassLight(ref);

  return (
    <button
      ref={ref}
      aria-label={nav.theme}
      className="lg grid size-10 place-items-center rounded-full"
      data-cursor={nav.lights}
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();

        switchTheme(resolvedTheme === "dark" ? "light" : "dark", setTheme, {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
        });
      }}
    >
      <span className="lg-caustic" />
      <svg aria-hidden className="size-[18px]" fill="none" viewBox="0 0 24 24">
        <mask id="theme-moon-mask">
          <rect fill="white" height="24" width="24" />
          <circle
            className="origin-center translate-x-[9px] -translate-y-[9px] transition-transform duration-500 ease-out dark:translate-x-0 dark:translate-y-0"
            cx="17"
            cy="7"
            fill="black"
            r="6"
          />
        </mask>
        <circle
          className="origin-center scale-[0.55] transition-transform duration-500 ease-out dark:scale-100"
          cx="12"
          cy="12"
          fill="currentColor"
          mask="url(#theme-moon-mask)"
          r="8"
        />
        <g
          className="origin-center stroke-current transition-[opacity,rotate] duration-500 dark:rotate-45 dark:opacity-0"
          strokeLinecap="round"
          strokeWidth="2"
        >
          <path d="M12 1.5v2.2M12 20.3v2.2M1.5 12h2.2M20.3 12h2.2M4.6 4.6l1.5 1.5M17.9 17.9l1.5 1.5M4.6 19.4l1.5-1.5M17.9 6.1l1.5-1.5" />
        </g>
      </svg>
    </button>
  );
}
