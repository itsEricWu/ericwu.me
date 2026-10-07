import { MetadataRoute } from "next";

import { notionBlogConfig, siteConfig } from "@/config/site";
import { localePath } from "@/lib/i18n";
import { getAllBlogPosts } from "@/lib/notion";

/** A page's entry in each language, each listing the other as an alternate. */
const bothLanguages = (
  path: string,
  entry: Omit<MetadataRoute.Sitemap[number], "url">,
): MetadataRoute.Sitemap => {
  const languages = {
    en: `${siteConfig.url}${path === "/" ? "" : path}`,
    "zh-CN": `${siteConfig.url}${localePath("zh", path)}`,
  };

  return Object.values(languages).map((url) => ({
    ...entry,
    url,
    alternates: { languages },
  }));
};

type ChangeFrequency =
  "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = await getAllBlogPosts(notionBlogConfig.blogParentId);
  const changeFrequency: ChangeFrequency = "weekly";

  const blogs = blogPosts.flatMap(({ id, lastEditedAt }) =>
    bothLanguages(`/blog/${id}`, {
      lastModified: lastEditedAt?.toISOString() ?? new Date().toISOString(),
      changeFrequency,
      priority: 0.7,
    }),
  );

  const latestBlogEdit =
    blogPosts.length > 0
      ? (blogPosts
          .reduce((latest, post) =>
            (post.lastEditedAt?.getTime() ?? 0) >
            (latest.lastEditedAt?.getTime() ?? 0)
              ? post
              : latest,
          )
          .lastEditedAt?.toISOString() ?? new Date().toISOString())
      : new Date().toISOString();

  const routes: MetadataRoute.Sitemap = [
    ...bothLanguages("/", {
      lastModified: latestBlogEdit,
      changeFrequency: "weekly" as ChangeFrequency,
      priority: 1.0,
    }),
    ...bothLanguages("/blog", {
      lastModified: latestBlogEdit,
      changeFrequency: "weekly" as ChangeFrequency,
      priority: 0.8,
    }),
  ];

  return [...routes, ...blogs];
}
