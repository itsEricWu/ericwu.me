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

  const blogs = blogPosts.map(({ id, createdAt }) => ({
    url: `${siteConfig.url}/blog/${id}`,
    lastModified: createdAt.toISOString(),
    changeFrequency,
    priority: 0.7,
  }));

  const routes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as ChangeFrequency,
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily" as ChangeFrequency,
      priority: 0.8,
    },
  ];

  return [...routes, ...blogs];
}
