import { BentoGrid, type BentoItem } from "@/components/bento/bento-grid";
import { ArtifactsCard } from "@/components/cards/artifacts";
import { EmojiCard } from "@/components/cards/emoji";
import { FinOpsCard } from "@/components/cards/finops";
import { GlobeCard } from "@/components/cards/globe";
import { HeroCard } from "@/components/cards/hero";
import { MiniCard } from "@/components/cards/mini-card";
import { PackBookCard } from "@/components/cards/packbook";
import { PhotoDeck } from "@/components/cards/photo-deck";
import { ProjectCard } from "@/components/cards/project";
import { SkyCard } from "@/components/cards/sky";
import { TechSphere } from "@/components/cards/tech-sphere";
import { WritingCard } from "@/components/cards/writing";
import { projects } from "@/config/site";
import { getHomeData, getLatestPosts } from "@/lib/data";

// Static, refreshed hourly: Firebase URLs and the latest posts are baked in.
export const revalidate = 3600;

export default async function Page() {
  const [home, posts] = await Promise.all([getHomeData(), getLatestPosts()]);

  // Order matters: the grid packs densely in this order. On desktop (4 columns):
  //   [hero      ][finops    ]
  //   [hero      ][artifacts ]
  //   [sky][globe][secondself]
  //   [pack][photos    ][web]
  //   [pack][photos    ][web]
  //   [chatbot   ][tech][mini]
  //   [emoji][paper][writing ]
  const items: BentoItem[] = [
    {
      id: "hero",
      tags: ["about"],
      label: "About Eric",
      className: "col-span-2 row-span-3 sm:row-span-3 lg:row-span-2",
      still: true,
      content: <HeroCard avatarUrl={home.avatarUrl} dogUrl={home.dogUrl} />,
    },
    {
      id: "finops",
      tags: ["work"],
      label: "AWS FinOps Agent",
      className: "col-span-2 row-span-2 sm:row-span-1",
      content: <FinOpsCard />,
    },
    {
      id: "artifacts",
      tags: ["work"],
      label: "Amazon Q artifacts",
      className: "col-span-2 row-span-2 sm:row-span-1",
      content: <ArtifactsCard />,
    },
    {
      id: "sky",
      tags: ["about"],
      label: "Seattle sky and theme switch",
      className: "col-span-1 row-span-1",
      content: <SkyCard />,
    },
    {
      id: "globe",
      tags: ["about"],
      label: "Purdue, UCLA, Seattle",
      className: "col-span-1 row-span-1",
      content: <GlobeCard />,
    },
    {
      id: "secondself",
      tags: ["projects"],
      label: projects.secondself.name,
      className: "col-span-2 row-span-1",
      content: (
        <ProjectCard
          height={1280}
          image={home.secondselfUrl}
          look="secondself"
          project={projects.secondself}
          width={2259}
        />
      ),
    },
    {
      id: "packbook",
      tags: ["projects"],
      label: "PackBook",
      className: "col-span-2 row-span-2 sm:col-span-1",
      content: <PackBookCard />,
    },
    {
      id: "photos",
      tags: ["about"],
      label: "Photos",
      className: "col-span-2 row-span-2",
      content: <PhotoDeck photos={home.photos} />,
    },
    {
      id: "webagent",
      tags: ["projects"],
      label: projects.webagent.name,
      className: "col-span-1 row-span-2",
      content: (
        <ProjectCard
          height={800}
          image={home.webagentUrl}
          look="webagent"
          project={projects.webagent}
          width={1000}
        />
      ),
    },
    {
      id: "chatbot",
      tags: ["projects"],
      label: projects.chatbot.name,
      className: "col-span-2 row-span-1",
      content: (
        <ProjectCard
          height={1280}
          image={home.chatbotUrl}
          look="chatbot"
          project={projects.chatbot}
          width={2629}
        />
      ),
    },
    {
      id: "tech",
      tags: ["about", "work"],
      label: "Toolbox",
      className: "col-span-1 row-span-1",
      content: <TechSphere />,
    },
    {
      id: "mini",
      tags: ["about"],
      label: "Mini Cooper",
      className: "col-span-1 row-span-1",
      content: <MiniCard />,
    },
    {
      id: "emoji",
      tags: ["projects"],
      label: "Text to emoji",
      className: "col-span-1 row-span-1",
      content: <EmojiCard />,
    },
    {
      id: "paper",
      tags: ["projects", "work"],
      label: projects.paper.name,
      className: "col-span-1 row-span-1",
      content: (
        <ProjectCard
          height={1280}
          image={home.paperUrl}
          look="paper"
          project={projects.paper}
          width={1577}
        />
      ),
    },
    {
      id: "writing",
      tags: ["about"],
      label: "Latest writing",
      className: "col-span-2 row-span-2 sm:row-span-1",
      content: <WritingCard posts={posts} />,
    },
  ];

  return <BentoGrid items={items} />;
}
