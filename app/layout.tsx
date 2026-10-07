import "@/styles/globals.css";

import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";

import { Backdrop } from "@/components/backdrop/backdrop";
import { CursorLens } from "@/components/glass/cursor-lens";
import { SiteNav } from "@/components/nav/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { FontLoader } from "@/components/font-loader";
import { deferredFaces, fontDisplay, fontName, fontText } from "@/config/fonts";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author, url: siteConfig.url }],
  creator: siteConfig.author,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f2f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f11" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: "en-US",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${fontText.variable} ${fontDisplay.variable} ${fontName.variable}`}
      lang="en"
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
          <a
            className="sr-only fixed top-3 left-3 z-[80] rounded-full bg-ink px-4 py-2 text-bg focus:not-sr-only"
            href="#main"
          >
            Skip to content
          </a>
          <Backdrop />
          <SiteNav />
          <main
            className="relative z-10 mx-auto w-full max-w-[1240px] grow px-3 pt-6 pb-6 sm:px-6 sm:pt-24 sm:pb-9"
            id="main"
          >
            {children}
          </main>
          <SiteFooter />
          <CursorLens />
        </ThemeProvider>
        <FontLoader faces={deferredFaces} />
        <Analytics />
      </body>
    </html>
  );
}
