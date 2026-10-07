"use client";

import Link from "next/link";

import { useLocale, useT } from "@/components/locale-provider";
import { localePath } from "@/lib/i18n";

// Not-found pages get no params; the language comes from the layout's provider.
export default function NotFound() {
  const lang = useLocale();
  const { notFound: t, common } = useT();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <p className="eyebrow">{t.eyebrow}</p>
      <h1 className="font-display text-[clamp(4rem,14vw,8rem)] leading-none font-semibold tracking-[-0.03em]">
        {t.title}
        <span className="text-glacier">{common.period}</span>
      </h1>
      <p className="max-w-[40ch] text-[15px] text-pretty text-ink-2">
        {t.body}
      </p>
      <Link
        className="lg mt-2 inline-flex h-10 items-center rounded-full px-5 text-sm font-medium"
        href={localePath(lang, "/")}
      >
        <span aria-hidden className="lg-caustic" />
        <span>{t.home}</span>
      </Link>
    </div>
  );
}
