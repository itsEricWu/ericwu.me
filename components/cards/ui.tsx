import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Small sentence-case label above a title (Apple's eyebrow). */
export function Eyebrow({
  children,
  accent,
  className,
}: {
  children: ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <p className={cn("eyebrow", accent && "text-ember-ink", className)}>
      {children}
    </p>
  );
}

export function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn("size-3.5", className)}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function Chevron({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn("size-3", className)}
      fill="none"
      viewBox="0 0 12 12"
    >
      <path
        d="M4.5 2.5 8 6l-3.5 3.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

/** Apple-style text link: "Learn more ›". */
export function TextLink({
  href,
  children,
  className,
  label,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  /** A fuller accessible name; it should start with the visible text. */
  label?: string;
}) {
  const external = href.startsWith("http");

  return (
    <a
      aria-label={label}
      className={cn(
        "group/link inline-flex items-center gap-1 text-[15px] font-medium text-glacier-ink hover:underline hover:underline-offset-4",
        className,
      )}
      data-cursor={external ? "Open ↗" : undefined}
      href={href}
      rel={external ? "noopener noreferrer" : undefined}
      target={external ? "_blank" : undefined}
    >
      {children}
      <Chevron className="transition-transform duration-300 group-hover/link:translate-x-0.5" />
    </a>
  );
}

/** Frosted glass pill link (CSS-only glass, no JS). */
export function GlassLink({
  href,
  children,
  className,
  cursor,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  cursor?: string;
}) {
  const external = href.startsWith("http");

  return (
    <a
      className={cn(
        "lg group/link inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium transition-[scale] duration-300 hover:scale-[1.04] active:scale-[0.97]",
        className,
      )}
      data-cursor={cursor ?? (external ? "Open ↗" : undefined)}
      href={href}
      rel={external ? "noopener noreferrer" : undefined}
      target={external ? "_blank" : undefined}
    >
      <span aria-hidden className="lg-caustic" />
      <span>{children}</span>
      <ArrowUpRight className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
    </a>
  );
}

export function SampleNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-[11px] text-muted", className)}>
      Illustration with sample data
    </p>
  );
}
