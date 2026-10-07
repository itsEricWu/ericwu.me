import { Metadata } from "next";
import { notFound } from "next/navigation";

import { NotionPage } from "@/components/blog/notion-page";
import {
  getAllBlogPosts,
  getPost,
  extractDescription,
  coverImageUrl,
} from "@/lib/notion";
import { notionBlogConfig, siteConfig } from "@/config/site";
import {
  alternates,
  htmlLang,
  isLocale,
  localePath,
  ogLocale,
} from "@/lib/i18n";
import { getMessages } from "@/messages";

export const revalidate = 3600;

type Props = { params: Promise<{ lang: string; blogId: string }> };

// Prebuild every post so first visits are static; new posts render on demand.
export async function generateStaticParams() {
  try {
    const posts = await getAllBlogPosts(notionBlogConfig.blogParentId);

    return posts.map((p) => ({ blogId: p.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, blogId } = await params;

  if (!isLocale(lang)) return {};
  const { blog } = getMessages(lang);
  const { title, recordMap, block } = await getPost(lang, blogId);

  const postTitle = title || blog.fallbackTitle;
  const description =
    extractDescription(recordMap) || blog.byline(postTitle, siteConfig.author);
  const path = `/blog/${blogId}`;

  const coverUrl = block?.format?.page_cover;
  const ogImages = coverUrl
    ? [{ url: coverImageUrl(coverUrl, block), alt: postTitle }]
    : [{ url: "/og-image.png", alt: postTitle }];

  return {
    title: postTitle,
    description,
    alternates: alternates(lang, path),
    openGraph: {
      title: postTitle,
      description,
      type: "article",
      locale: ogLocale[lang],
      url: localePath(lang, path),
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

export default async function Page({ params }: Props) {
  const { lang, blogId } = await params;

  if (!isLocale(lang)) notFound();
  const { blog } = getMessages(lang);
  const post = await getPost(lang, blogId);
  const { recordMap, rootPageId, translated, block } = post;
  const title = post.title || blog.fallbackTitle;

  const coverUrl = block?.format?.page_cover;
  const description =
    extractDescription(recordMap) || blog.byline(title, siteConfig.author);
  const url = `${siteConfig.url}${localePath(lang, `/blog/${blogId}`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: htmlLang[translated ? lang : "en"],
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
      "@id": url,
    },
    url,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NotionPage
        created={block?.created_time}
        notice={translated ? undefined : blog.untranslated}
        recordMap={recordMap}
        rootPageId={rootPageId}
        title={title}
      />
    </>
  );
}
