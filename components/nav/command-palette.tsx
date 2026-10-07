"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { LiquidGlass } from "@/components/glass/liquid-glass";
import { projects, siteConfig } from "@/config/site";
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
        group: "Navigate",
        label: "Everything",
        hint: "All cards",
        icon: <Dot className="bg-glacier" />,
        run: go("all"),
      },
      {
        id: "about",
        group: "Navigate",
        label: "About me",
        icon: <Dot className="bg-glacier" />,
        run: go("about"),
      },
      {
        id: "work",
        group: "Navigate",
        label: "Work at AWS",
        keywords: "amazon finops q artifacts",
        icon: <Dot className="bg-ember" />,
        run: go("work"),
      },
      {
        id: "projects",
        group: "Navigate",
        label: "Side projects",
        keywords: "packbook secondself",
        icon: <Dot className="bg-ember" />,
        run: go("projects"),
      },
      {
        id: "blog",
        group: "Navigate",
        label: "Read the blog",
        keywords: "writing posts",
        icon: <Dot className="bg-ink-2" />,
        run: go("blog"),
      },
      ...Object.values(projects).map((p) => ({
        id: p.id,
        group: "Projects",
        label: p.name,
        hint: p.linkLabel,
        keywords: p.kicker,
        icon: <Arrow />,
        run: open(p.href),
      })),
      {
        id: "github",
        group: "Connect",
        label: "GitHub",
        hint: "@itsEricWu",
        icon: <Arrow />,
        run: open(siteConfig.links.github),
      },
      {
        id: "linkedin",
        group: "Connect",
        label: "LinkedIn",
        icon: <Arrow />,
        run: open(siteConfig.links.linkedin),
      },
      {
        id: "email",
        group: "Connect",
        label: "Copy email address",
        hint: siteConfig.email,
        keywords: "mail contact",
        icon: <Dot className="bg-glacier" />,
        run: () => {
          navigator.clipboard?.writeText(siteConfig.email).then(
            () => setToast("Email copied"),
            () => setToast(siteConfig.email),
          );
          window.setTimeout(onClose, 900);
        },
      },
      {
        id: "theme",
        group: "Settings",
        label:
          resolvedTheme === "dark"
            ? "Turn the lights on"
            : "Turn the lights off",
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
        id: "bert",
        group: "Fun",
        label: "Meet Bert",
        hint: "the dog",
        keywords: "dog avatar",
        icon: <Dot className="bg-ember" />,
        run: fire("eric:bert"),
      },
      {
        id: "mini",
        group: "Fun",
        label: "Spin up the Mini in 3D",
        keywords: "car three",
        icon: <Dot className="bg-ember" />,
        run: fire("eric:mini"),
      },
      {
        id: "home",
        group: "Fun",
        label: "Back to the top",
        icon: <Dot className="bg-muted" />,
        run: () => {
          router.push("/");
          window.scrollTo({ top: 0, behavior: "smooth" });
          onClose();
        },
      },
    ];
  }, [onClose, onSelectTab, resolvedTheme, router, setTheme]);

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

    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <div
      aria-label="Command palette"
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
        className="w-full max-w-[600px] overflow-hidden rounded-[26px] bg-card/80 [--lg-blur:24px] [animation:rise_.45s_cubic-bezier(.2,.8,.2,1)_both] dark:bg-card/75"
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
            aria-label="Search commands"
            className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-muted"
            placeholder="Jump to a project, copy my email, meet Bert…"
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
              Nothing matches “{query}”.
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
          <span>↑↓ to move · ↵ to open</span>
          <span aria-live="polite">{toast ?? "ericwu.me"}</span>
        </div>
      </LiquidGlass>
    </div>
  );
}
