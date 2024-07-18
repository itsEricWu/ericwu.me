import Home from "@/components/home";
import { getPhotoUrl, listPhotos } from "@/firebase/db/photo";

export default async function App() {
  const photosPromise = listPhotos("photos");
  const avatarUrlPromise = getPhotoUrl("avatar/eric.jpg");
  const dogUrlPromise = getPhotoUrl("avatar/dog.jpg");
  const actionImageUrlPromise = getPhotoUrl("projects/actions.jpg");
  const webagentUrlPromise = getPhotoUrl("projects/webagent.jpg");
  const chatbotUrlPromise = getPhotoUrl("projects/chatbot.jpg");
  const resumeUrlPromise = getPhotoUrl("Chengxiang-Wu-Resume-2024.pdf");
  const paperUrlPromise = getPhotoUrl("projects/paper.jpg");

  const [
    photos,
    avatarUrl,
    dogUrl,
    actionImageUrl,
    resumeUrl,
    webagentUrl,
    chatbotUrl,
    paperUrl,
  ] = await Promise.all([
    photosPromise,
    avatarUrlPromise,
    dogUrlPromise,
    actionImageUrlPromise,
    resumeUrlPromise,
    webagentUrlPromise,
    chatbotUrlPromise,
    paperUrlPromise,
  ]);

  return (
    <Home
      actionImageUrl={actionImageUrl}
      avatarUrl={avatarUrl}
      chatbotUrl={chatbotUrl}
      dogUrl={dogUrl}
      paperUrl={paperUrl}
      photos={photos}
      resumeUrl={resumeUrl}
      webagentUrl={webagentUrl}
    />
  );
}
