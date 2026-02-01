import { customMapImageUrl, getAllBlogPosts } from "@/lib/notion";
import { notionBlogConfig } from "@/config/site";
import { BlogList } from "@/components/blog-list";

export const revalidate = 0;

export default async function Page() {
  const blogPosts = await getAllBlogPosts(notionBlogConfig.blogParentId);

  const postsWithImages = blogPosts.map((post) => ({
    ...post,
    imageUrl: customMapImageUrl(post.pageCover, post.block),
  }));

  return <BlogList blogPosts={postsWithImages} />;
}
