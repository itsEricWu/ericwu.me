import Link from "next/link";

import { Cover } from "@/components/blog/cover";
import { Eyebrow } from "@/components/cards/ui";
import { formatDate, localePath, type Locale } from "@/lib/i18n";
import { getMessages } from "@/messages";
import type { Blog } from "@/types/blog";

type Post = Blog & { imageUrl: string | undefined };

export function BlogList({
  blogPosts,
  lang,
}: {
  blogPosts: Post[];
  lang: Locale;
}) {
  const { blog, common } = getMessages(lang);
  const fmt = (d: Date | null) =>
    d
      ? formatDate(lang, d, { month: "short", day: "numeric", year: "numeric" })
      : "";

  return (
    <div>
      <header className="mb-8 flex flex-col items-start gap-3 pt-2 sm:mb-10">
        <Eyebrow>{blog.eyebrow(blogPosts.length)}</Eyebrow>
        <h1 className="font-display text-[clamp(2.6rem,6vw,3.8rem)] leading-[1.02] font-semibold tracking-[-0.02em]">
          {blog.heading}
          <span className="text-glacier">{common.period}</span>
        </h1>
        <p className="max-w-[56ch] text-[15px] text-pretty text-ink-2 sm:text-[16px]">
          {blog.intro}
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map(({ id, title, imageUrl, createdAt, description }, i) => (
          <Link
            key={id}
            className="card group flex flex-col transition-[translate,box-shadow] duration-500 hover:-translate-y-1"
            data-cursor={blog.read}
            href={localePath(lang, `/blog/${id}`)}
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-card-2">
              <Cover index={i} src={imageUrl} title={title} />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
              <h2 className="text-[1.05rem] leading-snug font-semibold tracking-tight transition-colors group-hover:text-glacier">
                {title}
              </h2>
              {description && (
                <p className="line-clamp-2 text-[13.5px] text-ink-2">
                  {description}
                </p>
              )}
              {createdAt && (
                <time
                  className="mt-auto pt-2 text-[13px] text-muted"
                  dateTime={createdAt.toISOString()}
                >
                  {fmt(createdAt)}
                </time>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
