"use client";

import { useT } from "@/components/locale-provider";

export default function BlogLoading() {
  const { blog } = useT();

  return (
    <div aria-busy="true" aria-label={blog.loading}>
      {/* The same shape as the list's header, so nothing jumps when it lands. */}
      <div className="mb-8 flex flex-col items-start gap-3 pt-2 sm:mb-10">
        <div className="h-4 w-28 animate-pulse rounded-full bg-card-2" />
        <div className="h-[clamp(2.6rem,6vw,3.8rem)] w-56 animate-pulse rounded-2xl bg-card-2" />
        <div className="h-5 w-full max-w-[30rem] animate-pulse rounded-full bg-card-2" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-[24px] bg-card-2 sm:rounded-[28px]"
          />
        ))}
      </div>
    </div>
  );
}
