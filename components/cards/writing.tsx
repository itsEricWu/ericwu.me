import Link from "next/link";

import { Chevron } from "./ui";

export type PostSummary = {
  id: string;
  title: string;
  createdAt: string | null;
};

const fmt = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "";

export function WritingCard({ posts }: { posts: PostSummary[] }) {
  return (
    <div className="flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-[17px] font-semibold tracking-[-0.005em]">
          Writing
        </p>
        <Link
          className="inline-flex items-center gap-1 text-[13px] font-medium text-glacier-ink hover:underline hover:underline-offset-4"
          data-cursor="All posts"
          href="/blog"
        >
          All posts
          <Chevron />
        </Link>
      </div>
      <ul className="mt-2 flex flex-1 flex-col justify-start divide-y divide-line sm:justify-center">
        {posts.slice(0, 5).map((p, i) => (
          <li key={p.id} className={i >= 3 ? "sm:hidden" : undefined}>
            <Link
              className="group flex items-baseline justify-between gap-4 py-2.5"
              data-cursor="Read"
              href={`/blog/${p.id}`}
              prefetch={false}
            >
              <span className="truncate text-[15px] font-medium transition-colors group-hover:text-glacier">
                {p.title}
              </span>
              <time
                className="shrink-0 text-[13px] text-muted tabular-nums"
                dateTime={p.createdAt ?? undefined}
              >
                {fmt(p.createdAt)}
              </time>
            </Link>
          </li>
        ))}
        {posts.length === 0 && (
          <li className="py-3 text-[14px] text-ink-2">
            <Link className="hover:text-glacier" href="/blog">
              Read the blog →
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}
