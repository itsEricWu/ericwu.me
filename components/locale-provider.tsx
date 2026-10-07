"use client";

import { createContext, use, type ReactNode } from "react";

import type { Locale } from "@/lib/i18n";
import { messages } from "@/messages";

const LocaleContext = createContext<Locale>("en");

/** Hands the page's language to client components. */
export function LocaleProvider({
  lang,
  children,
}: {
  lang: Locale;
  children: ReactNode;
}) {
  return <LocaleContext value={lang}>{children}</LocaleContext>;
}

export const useLocale = () => use(LocaleContext);

/** The strings for the page's language. */
export const useT = () => messages[use(LocaleContext)];
