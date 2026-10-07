import { cache } from "react";
import { ref, getDownloadURL, listAll } from "firebase/storage";

import { storage } from "@/firebase/firebase";
import { notionBlogConfig } from "@/config/site";
import { getAllBlogPosts } from "@/lib/notion";

// Use React cache to dedupe requests within a single render pass
export const getHomeData = cache(async () => {
  const paths = {
    photos: "photos",
    avatar: "avatar/eric.jpg",
    dog: "avatar/dog.jpg",
    secondself: "projects/secondself.jpg",
    webagent: "projects/webagent.jpg",
    chatbot: "projects/chatbot.jpg",
    paper: "projects/paper.jpg",
  };

  const allPaths = [
    paths.avatar,
    paths.dog,
    paths.secondself,
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
    secondselfUrl: urlResults[2],
    webagentUrl: urlResults[3],
    chatbotUrl: urlResults[4],
    paperUrl: urlResults[5],
  };
});

/** Latest posts for the home page; the page still renders if Notion is down. */
export const getLatestPosts = cache(async () => {
  try {
    const posts = await getAllBlogPosts(notionBlogConfig.blogParentId);

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
