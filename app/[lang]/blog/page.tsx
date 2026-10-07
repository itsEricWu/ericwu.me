import { Metadata } from "next";
import { notFound } from "next/navigation";

import { coverImageUrl, getBlogPosts } from "@/lib/notion";
import { BlogList } from "@/components/blog/blog-list";
import { alternates, isLocale, localePath } from "@/lib/i18n";
import { getMessages } from "@/messages";

export const revalidate = 3600;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;

  if (!isLocale(lang)) return {};
  const { blog } = getMessages(lang);

  return {
    title: blog.title,
    description: blog.description,
    alternates: alternates(lang, "/blog"),
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: "website",
      url: localePath(lang, "/blog"),
    },
  };
}

export default async function Page({ params }: Props) {
  const { lang } = await params;

  if (!isLocale(lang)) notFound();
  const blogPosts = await getBlogPosts(lang);

  const postsWithImages = blogPosts.map((post) => ({
    ...post,
    imageUrl: post.pageCover
      ? coverImageUrl(post.pageCover, post.block)
      : undefined,
  }));

  return <BlogList blogPosts={postsWithImages} lang={lang} />;
}
