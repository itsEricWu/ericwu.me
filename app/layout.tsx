import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";
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
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          fontUbuntu.className,
          "tracking-wide",
          fontOleoScript.variable
        )}
      >
        <Providers themeProps={{ attribute: "class" }}>
          <div className="relative flex flex-col bg-[#f6f2f2] dark:bg-[#0b0f11] overflow-y-auto scrollbar-hide min-h-screen">
            <main className="container mx-auto max-w-7xl pt-10 md:pt-16 flex flex-col">
              {children}
              <Analytics />
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
