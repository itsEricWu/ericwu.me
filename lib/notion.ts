import { cache } from "react";

import { NotionAPI } from "notion-client";
import { Block, ExtendedRecordMap } from "notion-types";
import { getBlockValue, getPageTitle } from "notion-utils";

import { Blog } from "@/types/blog";
import { notionBlogConfig } from "@/config/site";
import type { Locale } from "@/lib/i18n";

// notion-client 8 sends a browser-acceptable User-Agent and understands Notion's
// nested { value: { value, role } } block entries, so no workarounds are needed.
const notion = new NotionAPI();

/** A block's value, whether Notion returned it flat or nested. */
export const blockOf = (
  entry: ExtendedRecordMap["block"][string] | undefined,
) => getBlockValue<Block>(entry);

export const getPageContent = cache(async (pageId: string) => {
  const recordMap = await notion.getPage(pageId);
  const title = getPageTitle(recordMap);
  const blocks = recordMap.block;

  return { title, blocks, recordMap };
});

export async function getAllBlogPosts(pageId: string) {
  const recordMap = await notion.getPage(pageId);
  const blocks = recordMap.block;

  const blogPosts: Blog[] = [];

  Object.entries(blocks).forEach(([key, value]) => {
    const block = blockOf(value);
    if (
      !block ||
      key === notionBlogConfig.blogParentId ||
      block.type !== "page" ||
      !block.properties?.title ||
      // Only the Blog page's own children: a post's translation is a page too.
      block.parent_id !== pageId
    ) {
      return;
    }
    blogPosts.push({
      id: key,
      block,
      pageCover: block.format?.page_cover ?? "",
      title: block.properties.title[0][0],
      createdAt: block.created_time ? new Date(block.created_time) : null,
      lastEditedAt: block.last_edited_time
        ? new Date(block.last_edited_time)
        : null,
      description:
        (block.properties as Record<string, unknown[][]>)?.[
          "\\u2O5F"
        ]?.[0]?.[0]?.toString() ?? "",
    });
  });

  blogPosts.sort(
    (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
  );

  return blogPosts;
}

const CJK = /[\u3400-\u9fff]/;

const plainTitle = (block: Block | undefined) =>
  (block?.properties?.title as string[][] | undefined)
    ?.map((chunk) => chunk[0])
    .join("") ?? "";

/**
 * A post's Chinese version: a sub-page inside the post with a Chinese title.
 * An empty sub-page translates only the title (for posts that are all photos).
 */
export function findTranslation(
  post: Block | undefined,
  blocks: ExtendedRecordMap["block"],
) {
  for (const id of post?.content ?? []) {
    const block = blockOf(blocks[id]);
    const title = plainTitle(block);

    if (block?.type === "page" && CJK.test(title)) {
      return { id, title, empty: !block.content?.length };
    }
  }

  return null;
}

/** The recordMap with one child taken out of a block, so the page renders without it. */
function withoutChild(
  recordMap: ExtendedRecordMap,
  parentId: string,
  childId: string,
): ExtendedRecordMap {
  const entry = structuredClone(recordMap.block[parentId]);
  const parent = blockOf(entry);

  if (parent?.content) {
    parent.content = parent.content.filter((id) => id !== childId);
  }

  return { ...recordMap, block: { ...recordMap.block, [parentId]: entry } };
}

/**
 * A post in the given language. The URL always uses the original post's id; in
 * Chinese the content comes from its translation when it has one, and the
 * original (marked untranslated) when it doesn't.
 */
export const getPost = cache(async (lang: Locale, postId: string) => {
  const { recordMap, title } = await getPageContent(postId);
  const block = blockOf(recordMap.block[postId]);
  const translation = findTranslation(block, recordMap.block);
  const original = translation
    ? withoutChild(recordMap, postId, translation.id)
    : recordMap;
  const base = { block, recordMap: original, rootPageId: postId };

  if (lang === "en") return { ...base, title, translated: true };
  if (!translation) return { ...base, title, translated: false };
  if (translation.empty) {
    return { ...base, title: translation.title, translated: true };
  }
  const zh = await getPageContent(translation.id);

  return {
    block,
    recordMap: zh.recordMap,
    rootPageId: translation.id,
    title: translation.title,
    translated: true,
  };
});

/**
 * Every post, titled in the given language. Chinese titles come from the
 * translations: the posts' child blocks are fetched in a few batches rather
 * than loading every post (Notion throttles a burst of whole pages).
 */
export async function getBlogPosts(lang: Locale) {
  const posts = await getAllBlogPosts(notionBlogConfig.blogParentId);

  if (lang === "en") return posts;
  const ids = posts.flatMap((post) => post.block.content ?? []);
  const batches = Array.from({ length: Math.ceil(ids.length / 100) }, (_, i) =>
    ids.slice(i * 100, (i + 1) * 100),
  );

  try {
    const chunks = await Promise.all(
      batches.map((batch) => notion.getBlocks(batch)),
    );
    const blocks = Object.assign(
      {},
      ...chunks.map((chunk) => chunk.recordMap.block),
    ) as ExtendedRecordMap["block"];

    return posts.map((post) => {
      const translation = findTranslation(post.block, blocks);

      return translation ? { ...post, title: translation.title } : post;
    });
  } catch (error) {
    console.error("Failed to load post translations", error);

    return posts;
  }
}

/** Extract a plain-text excerpt from a Notion recordMap (first ~160 chars). */
export function extractDescription(recordMap: ExtendedRecordMap): string {
  const blocks = Object.values(recordMap.block);

  for (const block of blocks) {
    const value = blockOf(block);

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

const NOTION_HOST =
  /(^|\.)(notion\.so|notion\.com|notion-static\.com|notionusercontent\.com|amazonaws\.com)$/;

/**
 * A page cover's URL. Covers linked from other sites (Wikimedia, Unsplash, ...)
 * load from where they live: Notion's image proxy gets rate-limited by some of
 * them. Covers uploaded to Notion still go through Notion.
 */
export const coverImageUrl = (url: string, block: Block): string => {
  try {
    const { protocol, hostname } = new URL(url);

    if (protocol === "https:" && !NOTION_HOST.test(hostname)) return url;
  } catch {
    // A Notion path such as /images/page-cover/..., handled below.
  }

  return customMapImageUrl(url, block);
};
