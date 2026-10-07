import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

// Resolves the root opengraph-image for pages outside [lang] (the bare 404).
export const metadata: Metadata = { metadataBase: new URL(siteConfig.url) };

// The real root layout is app/[lang]/layout.tsx, which renders <html> in the
// page's language. This pass-through gives Next a fixed root above it, so a
// notFound() anywhere under [lang] renders [lang]/not-found.tsx in its layout.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
