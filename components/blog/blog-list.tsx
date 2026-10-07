import Link from "next/link";

import { Cover } from "@/components/blog/cover";
import { Eyebrow } from "@/components/cards/ui";
import type { Blog } from "@/types/blog";

type Post = Blog & { imageUrl: string | undefined };

const fmt = (d: Date | null) =>
  d
    ? d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : "";

export function BlogList({ blogPosts }: { blogPosts: Post[] }) {
  return (
    <div>
      <header className="mb-8 flex flex-col items-start gap-3 pt-2 sm:mb-10">
        <Eyebrow>
          Blog · {blogPosts.length} {blogPosts.length === 1 ? "post" : "posts"}
        </Eyebrow>
        <h1 className="font-display text-[clamp(2.6rem,6vw,3.8rem)] leading-[1.02] font-semibold tracking-[-0.02em]">
          Writing<span className="text-glacier">.</span>
        </h1>
        <p className="max-w-[56ch] text-[15px] text-pretty text-ink-2 sm:text-[16px]">
          Notes on AI agents, software engineering, and hiking with my dog Bert.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map(({ id, title, imageUrl, createdAt, description }, i) => (
          <Link
            key={id}
            className="card group flex flex-col transition-[translate,box-shadow] duration-500 hover:-translate-y-1"
            data-cursor="Read"
            href={`/blog/${id}`}
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
