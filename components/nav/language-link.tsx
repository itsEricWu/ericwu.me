"use client";

import { usePathname } from "next/navigation";

import { useLocale, useT } from "@/components/locale-provider";
import { htmlLang, localePath, stripLocale } from "@/lib/i18n";

/** This page in the other language, named in that language. */
export function LanguageLink({ className }: { className?: string }) {
  const lang = useLocale();
  const { nav } = useT();
  const path = stripLocale(usePathname());
  const other = lang === "en" ? "zh" : "en";

  return (
    <a
      className={className}
      data-cursor={nav.switchCursor}
      href={localePath(other, path)}
      hrefLang={htmlLang[other]}
      lang={htmlLang[other]}
    >
      {nav.switchCursor}
    </a>
  );
}
