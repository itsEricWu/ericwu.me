// Names this build, so a tab left open across a deploy can tell it is stale
// (see components/update-on-return.tsx).
const SITE_BUILD =
  process.env.VERCEL_GIT_COMMIT_SHA || `local-${Date.now().toString(36)}`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  env: { SITE_BUILD },
  experimental: {
    // Ship the (small) stylesheet inline so first paint never waits on a CSS request.
    inlineCss: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "www.notion.so",
      },
      // Blog covers linked straight from their source (see coverImageUrl).
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    const cached = [
      {
        key: "Cache-Control",
        value: "public, max-age=86400, stale-while-revalidate=604800",
      },
    ];

    return [
      { source: "/data/:path*", headers: cached },
      { source: "/emoji/:path*", headers: cached },
      { source: "/mini.:ext", headers: cached },
    ];
  },
};

module.exports = nextConfig;
