import { cache } from "react";

import { NotionAPI } from "notion-client";
import { Block, ExtendedRecordMap } from "notion-types";
import { getPageTitle } from "notion-utils";

import { Blog } from "@/types/blog";
import { notionBlogConfig } from "@/config/site";

const notion = new NotionAPI();

export const getPageContent = cache(async (pageId: string) => {
  const recordMap = await notion.getPage(pageId);
  const title = getPageTitle(recordMap);
  const blocks = recordMap.block;

  return { title, blocks, recordMap };
});

export async function getAllBlogPosts(pageId: string) {
  const recordMap = await notion.getPage(pageId);
  const blocks = recordMap.block;

  let blogPosts: Blog[] = [];

  Object.entries(blocks).map(([key, value]) => {
    if (key !== notionBlogConfig.blogParentId) {
      blogPosts.push({
        id: key,
        block: value.value,
        pageCover: value.value.format?.page_cover,
        title: value.value.properties?.title[0][0],
        createdAt: new Date(value.value.created_time),
        lastEditedAt: new Date(value.value.last_edited_time),
        description: value.value.properties?.["\\u2O5F"]?.[0]?.[0] ?? "",
      });
    }
  });

  // Sort by newest first
  blogPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return blogPosts;
}

/** Extract a plain-text excerpt from a Notion recordMap (first ~160 chars). */
export function extractDescription(recordMap: ExtendedRecordMap): string {
  const blocks = Object.values(recordMap.block);

  for (const block of blocks) {
    const value = block?.value;

    if (!value) continue;
    if (value.type !== "text" && value.type !== "quote") continue;

    const text = value.properties?.title
      ?.map((chunk: unknown[]) => chunk[0])
      .join("")
      .trim();

    if (text && text.length > 0) {
      return text.length > 160 ? text.slice(0, 157) + "..." : text;
    }
  }

  return "";
}

export const customMapImageUrl = (url: string, block: Block): string => {
  if (!url) {
    throw new Error("URL can't be empty");
  }

  if (url.startsWith("data:")) {
    return url;
  } // more recent versions of notion don't proxy unsplash images

  if (url.startsWith("https://images.unsplash.com")) {
    return url;
  }

  try {
    const u = new URL(url);

    if (
      u.pathname.startsWith("/secure.notion-static.com") &&
      u.hostname.endsWith(".amazonaws.com")
    ) {
      if (
        u.searchParams.has("X-Amz-Credential") &&
        u.searchParams.has("X-Amz-Signature") &&
        u.searchParams.has("X-Amz-Algorithm")
      ) {
        // if the URL is already signed, then use it as-is
        url = u.origin + u.pathname;
      }
    }
  } catch {
    // ignore invalid urls
  }

  if (url.startsWith("/images")) {
    url = `https://www.notion.so${url}`;
  }

  url = `https://www.notion.so${
    url.startsWith("/image") ? url : `/image/${encodeURIComponent(url)}`
  }`;

  const notionImageUrlV2 = new URL(url);
  let table = block.parent_table === "space" ? "block" : block.parent_table;

  if (table === "collection" || table === "team") {
    table = "block";
  }
  notionImageUrlV2.searchParams.set("table", table);
  notionImageUrlV2.searchParams.set("id", block.id);
  notionImageUrlV2.searchParams.set("cache", "v2");

  url = notionImageUrlV2.toString();

  return url;
};
