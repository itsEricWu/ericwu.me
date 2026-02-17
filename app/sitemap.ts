import { MetadataRoute } from "next";

import { notionBlogConfig, siteConfig } from "@/config/site";
import { getAllBlogPosts } from "@/lib/notion";

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = await getAllBlogPosts(notionBlogConfig.blogParentId);
  const changeFrequency: ChangeFrequency = "weekly";

  const blogs = blogPosts.map(({ id, lastEditedAt }) => ({
    url: `${siteConfig.url}/blog/${id}`,
    lastModified: lastEditedAt.toISOString(),
    changeFrequency,
    priority: 0.7,
  }));

  // Use the most recent blog post's edit time for the blog list page
  const latestBlogEdit =
    blogPosts.length > 0
      ? blogPosts
          .reduce((latest, post) =>
            post.lastEditedAt > latest.lastEditedAt ? post : latest,
          )
          .lastEditedAt.toISOString()
      : new Date().toISOString();

  const routes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: latestBlogEdit,
      changeFrequency: "weekly" as ChangeFrequency,
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified: latestBlogEdit,
      changeFrequency: "weekly" as ChangeFrequency,
      priority: 0.8,
    },
  ];

  return [...routes, ...blogs];
}
