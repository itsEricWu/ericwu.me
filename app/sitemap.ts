import { MetadataRoute } from "next";

import { notionBlogConfig } from "@/config/site";
import { getAllBlogPosts } from "@/lib/notion";

const WEBSITE_HOST_URL = process.env.SITE_URL;

type changeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let blogPosts = await getAllBlogPosts(notionBlogConfig.blogParentId);
  const changeFrequency = "daily" as changeFrequency;

  const blogs = blogPosts.map(({ id, createdAt }) => ({
    url: `${WEBSITE_HOST_URL}/blog/${id}`,
    lastModified: createdAt.toISOString(),
    changeFrequency,
  }));

  const routes = ["", "/blog"].map((route) => ({
    url: `${WEBSITE_HOST_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency,
  }));

  return [...routes, ...blogs];
}
