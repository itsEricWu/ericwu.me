import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "react-notion-x/src/styles.css";
import "prismjs/themes/prism-tomorrow.css";
import "@/styles/globals.css";

import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Analytics } from "@vercel/analytics/react";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontOleoScript, fontUbuntu } from "@/config/fonts";

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
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/og-image.png"],
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
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
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
      jobTitle: "Software Development Engineer",
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
    <html suppressHydrationWarning lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={clsx(
          fontUbuntu.className,
          "tracking-wide",
          fontOleoScript.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class" }}>
          <div className="relative flex flex-col bg-[#f6f2f2] dark:bg-[#0b0f11] overflow-y-auto scrollbar-hide min-h-screen">
            <main className="container mx-auto max-w-7xl pt-10 pb-[25px] md:pt-16 flex flex-col">
              {children}
              <Analytics />
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
