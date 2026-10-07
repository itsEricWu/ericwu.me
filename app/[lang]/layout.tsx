import "@/styles/globals.css";

import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";

import { Backdrop } from "@/components/backdrop/backdrop";
import { CursorLens } from "@/components/glass/cursor-lens";
import { SiteNav } from "@/components/nav/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { UpdateOnReturn } from "@/components/update-on-return";
import { FontLoader } from "@/components/font-loader";
import { LocaleProvider } from "@/components/locale-provider";
import {
  deferredFaces,
  fontDisplay,
  fontDisplayZh,
  fontName,
  fontText,
} from "@/config/fonts";
import { siteConfig } from "@/config/site";
import {
  alternates,
  htmlLang,
  isLocale,
  localePath,
  locales,
  ogLocale,
  type Locale,
} from "@/lib/i18n";
import { getMessages } from "@/messages";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;

  if (!isLocale(lang)) return {};
  const { meta } = getMessages(lang);

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: meta.siteName,
      template: `%s - ${meta.siteName}`,
    },
    description: meta.description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.author, url: siteConfig.url }],
    creator: siteConfig.author,
    alternates: alternates(lang, "/"),
    openGraph: {
      type: "website",
      locale: ogLocale[lang],
      alternateLocale: locales
        .filter((l) => l !== lang)
        .map((l) => ogLocale[l]),
      url: localePath(lang, "/"),
      siteName: meta.siteName,
      title: meta.siteName,
      description: meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.siteName,
      description: meta.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f2f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f11" },
  ],
};

const jsonLd = (lang: Locale) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: getMessages(lang).meta.siteName,
      description: getMessages(lang).meta.description,
      inLanguage: ["en-US", "zh-CN"],
    },
    {
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      name: "Eric Wu",
      alternateName: "Chengxiang Wu",
      url: siteConfig.url,
      jobTitle: "Software Development Engineer II",
      worksFor: {
        "@type": "Organization",
        name: "Amazon Web Services",
      },
      alumniOf: [
        {
          "@type": "CollegeOrUniversity",
          name: "University of California, Los Angeles",
        },
        {
          "@type": "CollegeOrUniversity",
          name: "Purdue University",
        },
      ],
      sameAs: [siteConfig.links.github, siteConfig.links.linkedin],
    },
  ],
});

export default async function RootLayout({
  children,
  params,
}: Props & { children: React.ReactNode }) {
  const { lang } = await params;

  if (!isLocale(lang)) notFound();
  const t = getMessages(lang);

  return (
    <html
      suppressHydrationWarning
      className={`${fontText.variable} ${fontDisplay.variable} ${fontName.variable} ${fontDisplayZh.variable}`}
      lang={htmlLang[lang]}
    >
      <head>
        {/* Returning visitors have the display face cached: use it from the first frame. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{localStorage.getItem("ff")&&document.documentElement.classList.add("ff")}catch(e){}',
          }}
        />
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(lang)) }}
          type="application/ld+json"
        />
      </head>
      <body>
        <ThemeProvider
          disableTransitionOnChange
          enableSystem
          attribute="class"
          defaultTheme="system"
        >
          <LocaleProvider lang={lang}>
            <a
              className="sr-only fixed top-3 left-3 z-[80] rounded-full bg-ink px-4 py-2 text-bg focus:not-sr-only"
              href="#main"
            >
              {t.meta.skip}
            </a>
            <Backdrop />
            <SiteNav />
            <main
              className="relative z-10 mx-auto w-full max-w-[1240px] grow px-3 pt-6 pb-6 sm:px-6 sm:pt-24 sm:pb-9"
              id="main"
            >
              {children}
            </main>
            <SiteFooter lang={lang} />
            <CursorLens />
            <UpdateOnReturn />
          </LocaleProvider>
        </ThemeProvider>
        <FontLoader faces={deferredFaces} />
        <Analytics />
      </body>
    </html>
  );
}
