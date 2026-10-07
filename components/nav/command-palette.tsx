"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { LiquidGlass } from "@/components/glass/liquid-glass";
import { useLocale, useT } from "@/components/locale-provider";
import { projects, siteConfig } from "@/config/site";
import { localePath, stripLocale } from "@/lib/i18n";
import { switchTheme } from "@/lib/theme-transition";
import { cn } from "@/lib/utils";
import type { View } from "@/lib/view-store";

type Command = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  keywords?: string;
  icon: ReactNode;
  run: () => void;
};

const Arrow = () => (
  <svg aria-hidden className="size-4" fill="none" viewBox="0 0 16 16">
    <path
      d="M5 11 11 5M6 5h5v5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
    />
  </svg>
);

const Dot = ({ className }: { className?: string }) => (
  <span aria-hidden className={cn("size-2 rounded-full", className)} />
);

function score(query: string, text: string) {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = text.toLowerCase();

  if (t.includes(q)) return 2 - t.indexOf(q) / 100;
  let i = 0;

  for (const ch of t) if (ch === q[i]) i++;

  return i === q.length ? 0.5 : 0;
}

export default function CommandPalette({
  onClose,
  onSelectTab,
}: {
  onClose: () => void;
  onSelectTab: (id: View | "blog") => void;
}) {
  const router = useRouter();
  const lang = useLocale();
  const { palette: t, projects: projectCopy } = useT();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands = useMemo<Command[]>(() => {
    const go = (id: View | "blog") => () => {
      onSelectTab(id);
      onClose();
    };
    const open = (href: string) => () => {
      window.open(href, "_blank", "noopener,noreferrer");
      onClose();
    };
    const fire =
      (event: string, view: View = "about") =>
      () => {
        onSelectTab(view);
        onClose();
        window.setTimeout(
          () => window.dispatchEvent(new CustomEvent(event)),
          450,
        );
      };

    return [
      {
        id: "all",
        group: t.groups.navigate,
        label: t.everything,
        hint: t.allCards,
        icon: <Dot className="bg-glacier" />,
        run: go("all"),
      },
      {
        id: "about",
        group: t.groups.navigate,
        label: t.about,
        icon: <Dot className="bg-glacier" />,
        run: go("about"),
      },
      {
        id: "work",
        group: t.groups.navigate,
        label: t.work,
        keywords:
          "aws amazon finops q artifacts side projects packbook secondself",
        icon: <Dot className="bg-ember" />,
        run: go("work"),
      },
      {
        id: "blog",
        group: t.groups.navigate,
        label: t.blog,
        keywords: "writing posts",
        icon: <Dot className="bg-ink-2" />,
        run: go("blog"),
      },
      ...Object.values(projects).map((p) => ({
        id: p.id,
        group: t.groups.projects,
        label: p.name,
        hint: p.linkLabel,
        keywords: `${p.kicker} ${projectCopy[p.id as keyof typeof projectCopy].kicker}`,
        icon: <Arrow />,
        run: open(p.href),
      })),
      {
        id: "github",
        group: t.groups.connect,
        label: "GitHub",
        hint: "@itsEricWu",
        icon: <Arrow />,
        run: open(siteConfig.links.github),
      },
      {
        id: "linkedin",
        group: t.groups.connect,
        label: "LinkedIn",
        icon: <Arrow />,
        run: open(siteConfig.links.linkedin),
      },
      {
        id: "email",
        group: t.groups.connect,
        label: t.copyEmail,
        hint: siteConfig.email,
        keywords: "mail contact",
        icon: <Dot className="bg-glacier" />,
        run: () => {
          navigator.clipboard?.writeText(siteConfig.email).then(
            () => setToast(t.emailCopied),
            () => setToast(siteConfig.email),
          );
          window.setTimeout(onClose, 900);
        },
      },
      {
        id: "theme",
        group: t.groups.settings,
        label: resolvedTheme === "dark" ? t.lightsOn : t.lightsOff,
        keywords: "theme dark light mode",
        icon: <Dot className="bg-ink" />,
        run: () => {
          onClose();
          switchTheme(resolvedTheme === "dark" ? "light" : "dark", setTheme, {
            x: window.innerWidth / 2,
            y: window.innerHeight * 0.2,
          });
        },
      },
      {
        id: "language",
        group: t.groups.settings,
        label: t.language,
        hint: t.languageHint,
        keywords: "language chinese english 语言 中文 英文",
        icon: <Dot className="bg-glacier" />,
        run: () => {
          // The other language is a different root layout: a full load.
          window.location.assign(
            localePath(lang === "en" ? "zh" : "en", stripLocale(pathname)) +
              window.location.hash,
          );
        },
      },
      {
        id: "bert",
        group: t.groups.fun,
        label: t.bert,
        hint: t.bertHint,
        keywords: "dog avatar",
        icon: <Dot className="bg-ember" />,
        run: fire("eric:bert"),
      },
      {
        id: "mini",
        group: t.groups.fun,
        label: t.mini,
        keywords: "car three",
        icon: <Dot className="bg-ember" />,
        run: fire("eric:mini"),
      },
      {
        id: "home",
        group: t.groups.fun,
        label: t.top,
        icon: <Dot className="bg-muted" />,
        run: () => {
          router.push(localePath(lang, "/"));
          window.scrollTo({ top: 0, behavior: "smooth" });
          onClose();
        },
      },
    ];
  }, [
    lang,
    onClose,
    onSelectTab,
    pathname,
    projectCopy,
    resolvedTheme,
    router,
    setTheme,
    t,
  ]);

  const results = useMemo(
    () =>
      commands
        .map((c) => ({
          c,
          s: score(query, `${c.label} ${c.keywords ?? ""} ${c.group}`),
        }))
        .filter((r) => r.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((r) => r.c),
    [commands, query],
  );

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    // Hand focus back only to someone navigating by keyboard; otherwise a
    // mouse-clicked control would light up with a focus ring on close.
    const restore = previous?.matches?.(":focus-visible") ?? false;

    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      if (restore) previous?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <div
      aria-label={t.dialog}
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-start justify-center px-3 pt-[12vh]"
      role="dialog"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* A sibling, not a parent: refraction nested inside another backdrop filter renders wrong in Chromium. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-black/20 backdrop-blur-[3px] [animation:fade-in_.3s_ease_both] dark:bg-black/50"
      />
      <LiquidGlass
        className="w-full max-w-[600px] overflow-hidden rounded-[26px] [--glass-tint:color-mix(in_oklab,var(--card)_80%,transparent)] [--lg-blur:24px] [animation:rise_.45s_cubic-bezier(.2,.8,.2,1)_both] dark:[--glass-tint:color-mix(in_oklab,var(--card)_75%,transparent)]"
        glass={{
          bezel: 22,
          thickness: 26,
          blur: 10,
          chroma: 0.08,
          saturate: 1.9,
        }}
      >
        <div className="flex items-center gap-3 border-b border-line px-5">
          <svg
            aria-hidden
            className="size-4 text-muted"
            fill="none"
            viewBox="0 0 16 16"
          >
            <circle
              cx="7"
              cy="7"
              r="5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="m11 11 3 3"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
          </svg>
          <input
            ref={inputRef}
            aria-activedescendant={
              results[active] ? `cmd-${results[active].id}` : undefined
            }
            aria-controls="cmd-list"
            aria-label={t.input}
            className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-muted"
            placeholder={t.placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(results.length - 1, i + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(0, i - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                results[active]?.run();
              }
            }}
          />
          <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[11px] font-medium text-muted">
            esc
          </kbd>
        </div>
        <div
          ref={listRef}
          className="no-scrollbar max-h-[min(420px,56vh)] overflow-y-auto p-2"
          id="cmd-list"
          role="listbox"
        >
          {results.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted">
              {t.empty(query)}
            </p>
          )}
          {results.map((c, i) => {
            const header = i === 0 || results[i - 1].group !== c.group;

            return (
              <div key={c.id}>
                {header && !query && (
                  <p className="eyebrow px-3 pt-3 pb-1">{c.group}</p>
                )}
                <div
                  aria-selected={i === active}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-[14px] transition-colors",
                    i === active
                      ? "bg-ink/[0.07] text-ink dark:bg-white/[0.08]"
                      : "text-ink-2",
                  )}
                  data-index={i}
                  id={`cmd-${c.id}`}
                  role="option"
                  onClick={c.run}
                  onPointerMove={() => setActive(i)}
                >
                  <span className="grid size-5 place-items-center text-muted">
                    {c.icon}
                  </span>
                  <span className="flex-1">{c.label}</span>
                  {c.hint && (
                    <span className="text-[12px] text-muted">{c.hint}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between border-t border-line px-5 py-2.5 text-[12px] text-muted">
          <span>{t.help}</span>
          <span aria-live="polite">{toast ?? "ericwu.me"}</span>
        </div>
      </LiquidGlass>
    </div>
  );
}
