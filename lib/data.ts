import { cache } from "react";
import { ref, getDownloadURL, listAll } from "firebase/storage";

import { storage } from "@/firebase/firebase";
import type { Locale } from "@/lib/i18n";
import { getBlogPosts } from "@/lib/notion";

// Use React cache to dedupe requests within a single render pass
export const getHomeData = cache(async () => {
  const paths = {
    photos: "photos",
    avatar: "avatar/eric.jpg",
    dog: "avatar/dog.jpg",
    webagent: "projects/webagent.jpg",
    chatbot: "projects/chatbot.jpg",
    paper: "projects/paper.jpg",
  };

  const allPaths = [
    paths.avatar,
    paths.dog,
    paths.webagent,
    paths.chatbot,
    paths.paper,
  ];

  // Parallel data fetching - initiate all requests at once
  const [photosResult, ...urlResults] = await Promise.all([
    listAll(ref(storage, paths.photos)).then((res) =>
      Promise.all(res.items.map((item) => getDownloadURL(item))),
    ),
    ...allPaths.map((p) => getDownloadURL(ref(storage, p))),
  ]);

  return {
    photos: photosResult,
    avatarUrl: urlResults[0],
    dogUrl: urlResults[1],
    webagentUrl: urlResults[2],
    chatbotUrl: urlResults[3],
    paperUrl: urlResults[4],
  };
});

/** Latest posts for the home page; the page still renders if Notion is down. */
export const getLatestPosts = cache(async (lang: Locale) => {
  try {
    const posts = await getBlogPosts(lang);

    return posts.map((p) => ({
      id: p.id,
      title: p.title,
      createdAt: p.createdAt ? p.createdAt.toISOString() : null,
    }));
  } catch (error) {
    console.error("Failed to load blog posts", error);

    return [];
  }
});
