import { Metadata } from "next";

import { customMapImageUrl, getAllBlogPosts } from "@/lib/notion";
import { notionBlogConfig } from "@/config/site";
import { BlogList } from "@/components/blog-list";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read Eric Wu's blog posts on software engineering, AI, agentic systems, full stack development, and more.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog",
    description:
      "Read Eric Wu's blog posts on software engineering, AI, agentic systems, full stack development, and more.",
    type: "website",
    url: "/blog",
  },
};

export default async function Page() {
  const blogPosts = await getAllBlogPosts(notionBlogConfig.blogParentId);

  const postsWithImages = blogPosts.map((post) => ({
    ...post,
    imageUrl: customMapImageUrl(post.pageCover, post.block),
  }));

  return <BlogList blogPosts={postsWithImages} />;
}
