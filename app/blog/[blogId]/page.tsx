import { Metadata } from "next";

import { NotionPage } from "@/components/blog/notion-page";
import {
  blockOf,
  getAllBlogPosts,
  getPageContent,
  extractDescription,
  coverImageUrl,
} from "@/lib/notion";
import { notionBlogConfig, siteConfig } from "@/config/site";

export const revalidate = 3600;

// Prebuild every post so first visits are static; new posts render on demand.
export async function generateStaticParams() {
  try {
    const posts = await getAllBlogPosts(notionBlogConfig.blogParentId);

    return posts.map((p) => ({ blogId: p.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ blogId: string }>;
}): Promise<Metadata> {
  const { blogId } = await params;
  const { title, recordMap } = await getPageContent(blogId);

  const postTitle = title || "Blog Post";
  const description =
    extractDescription(recordMap) || `${postTitle} - by ${siteConfig.author}`;

  const block = blockOf(recordMap.block[blogId]);
  const coverUrl = block?.format?.page_cover;
  const ogImages = coverUrl
    ? [{ url: coverImageUrl(coverUrl, block), alt: postTitle }]
    : [{ url: "/og-image.png", alt: postTitle }];

  return {
    title: postTitle,
    description,
    alternates: {
      canonical: `/blog/${blogId}`,
    },
    openGraph: {
      title: postTitle,
      description,
      type: "article",
      url: `/blog/${blogId}`,
      authors: [siteConfig.author],
      ...(block?.created_time && {
        publishedTime: new Date(block.created_time).toISOString(),
      }),
      ...(block?.last_edited_time && {
        modifiedTime: new Date(block.last_edited_time).toISOString(),
      }),
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: postTitle,
      description,
      images: ogImages.map((img) => img.url),
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

  const block = blockOf(recordMap.block[blogId]);
  const coverUrl = block?.format?.page_cover;
  const description =
    extractDescription(recordMap) || `${title} - by ${siteConfig.author}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    ...(block?.created_time && {
      datePublished: new Date(block.created_time).toISOString(),
    }),
    ...(block?.last_edited_time && {
      dateModified: new Date(block.last_edited_time).toISOString(),
    }),
    ...(coverUrl && {
      image: coverImageUrl(coverUrl, block),
    }),
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
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${blogId}`,
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
