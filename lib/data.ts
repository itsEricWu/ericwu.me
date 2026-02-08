import { cache } from "react";
import { ref, getDownloadURL, listAll } from "firebase/storage";

import { storage } from "@/firebase/firebase";

// Use React cache to dedupe requests within a single render pass
export const getHomeData = cache(async () => {
  const paths = {
    photos: "photos",
    avatar: "avatar/eric.jpg",
    dog: "avatar/dog.jpg",
    action: "projects/secondself.jpg",
    webagent: "projects/webagent.jpg",
    chatbot: "projects/chatbot.jpg",
    resume: "Chengxiang-Wu-Resume-2024.pdf",
    paper: "projects/paper.jpg",
  };

  const allPaths = [
    paths.avatar,
    paths.dog,
    paths.action,
    paths.webagent,
    paths.chatbot,
    paths.resume,
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
    actionImageUrl: urlResults[2],
    webagentUrl: urlResults[3],
    chatbotUrl: urlResults[4],
    resumeUrl: urlResults[5],
    paperUrl: urlResults[6],
  };
});
