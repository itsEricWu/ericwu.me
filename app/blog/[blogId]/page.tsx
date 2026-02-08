import { Metadata } from "next";

import { NotionPage } from "@/components/notion-page";
import { getPageContent } from "@/lib/notion";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ blogId: string }>;
}): Promise<Metadata> {
  const { blogId } = await params;
  const { title } = await getPageContent(blogId);

  const postTitle = title || "Blog Post";

  return {
    title: postTitle,
    description: `${postTitle} - by ${siteConfig.author}`,
    alternates: {
      canonical: `/blog/${blogId}`,
    },
    openGraph: {
      title: postTitle,
      description: `${postTitle} - by ${siteConfig.author}`,
      type: "article",
      url: `/blog/${blogId}`,
      authors: [siteConfig.author],
    },
    twitter: {
      card: "summary_large_image",
      title: postTitle,
      description: `${postTitle} - by ${siteConfig.author}`,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  const { blogId } = await params;
  const { recordMap, title } = await getPageContent(blogId);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    author: {
      "@type": "Person",
      name: siteConfig.author,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.author,
      url: siteConfig.url,
    },
    url: `${siteConfig.url}/blog/${blogId}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NotionPage
        recordMap={recordMap}
        rootPageId={blogId}
        title={title ?? undefined}
      />
    </>
  );
}
