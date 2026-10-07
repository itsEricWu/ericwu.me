import Link from "next/link";

import { FitList } from "./fit-list";
import { Chevron } from "./ui";

import { formatDate, localePath, type Locale } from "@/lib/i18n";
import { getMessages } from "@/messages";

export type PostSummary = {
  id: string;
  title: string;
  createdAt: string | null;
};

export function WritingCard({
  posts,
  lang,
}: {
  posts: PostSummary[];
  lang: Locale;
}) {
  const t = getMessages(lang);
  const fmt = (iso: string | null) =>
    iso ? formatDate(lang, iso, { month: "short", year: "numeric" }) : "";

  return (
    <div className="flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-[17px] font-semibold tracking-[-0.005em]">
          {t.writing.title}
        </p>
        <Link
          className="inline-flex items-center gap-1 text-[13px] font-medium text-glacier-ink hover:underline hover:underline-offset-4"
          data-cursor={t.writing.all}
          href={localePath(lang, "/blog")}
        >
          {t.writing.all}
          <Chevron />
        </Link>
      </div>
      {/* As many posts as the card has room for; the rows that show share out
          the spare height, so the list always ends at the card's inset. Rows
          never shrink, so FitList can see which ones overflow. */}
      <FitList className="mt-2 flex min-h-0 flex-1 flex-col">
        {posts.slice(0, 10).map((p) => (
          <li
            key={p.id}
            className="flex flex-[1_0_auto] flex-col border-t border-line first:border-t-0"
          >
            <Link
              className="group flex flex-1 items-center py-2.5"
              data-cursor={t.writing.read}
              href={localePath(lang, `/blog/${p.id}`)}
              prefetch={false}
            >
              <span className="flex w-full min-w-0 items-baseline justify-between gap-4">
                <span className="truncate text-[15px] font-medium transition-colors group-hover:text-glacier">
                  {p.title}
                </span>
                <time
                  className="shrink-0 text-[13px] text-muted tabular-nums"
                  dateTime={p.createdAt ?? undefined}
                >
                  {fmt(p.createdAt)}
                </time>
              </span>
            </Link>
          </li>
        ))}
        {posts.length === 0 && (
          <li className="py-3 text-[14px] text-ink-2">
            <Link
              className="hover:text-glacier"
              href={localePath(lang, "/blog")}
            >
              {t.writing.readBlog}
            </Link>
          </li>
        )}
      </FitList>
    </div>
  );
}
