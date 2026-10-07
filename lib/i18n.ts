export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** English keeps the bare paths it always had; Chinese lives under /zh. */
export function localePath(lang: Locale, path: string) {
  if (lang === "en") return path;

  return path === "/" ? "/zh" : `/zh${path}`;
}

/** The language a pathname is in. */
export const localeOf = (pathname: string): Locale =>
  pathname === "/zh" || pathname.startsWith("/zh/") ? "zh" : "en";

/** A pathname without its language prefix. */
export function stripLocale(pathname: string) {
  if (pathname === "/zh") return "/";

  return pathname.startsWith("/zh/") ? pathname.slice(3) : pathname;
}

export const htmlLang = { en: "en", zh: "zh-CN" } as const;
export const ogLocale = { en: "en_US", zh: "zh_CN" } as const;
export const dateLocale = { en: "en-US", zh: "zh-CN" } as const;

/** Canonical URL and hreflang alternates for a page that exists in both languages. */
export const alternates = (lang: Locale, path: string) => ({
  canonical: localePath(lang, path),
  languages: {
    en: path,
    "zh-CN": localePath("zh", path),
    "x-default": path,
  },
});

export const formatDate = (
  lang: Locale,
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions,
) =>
  new Date(date).toLocaleDateString(dateLocale[lang], {
    timeZone: "UTC",
    ...options,
  });
