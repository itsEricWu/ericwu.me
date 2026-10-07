import { notFound } from "next/navigation";

import secondselfShot from "@/assets/projects/secondself.webp";
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
import { isLocale } from "@/lib/i18n";
import { getMessages } from "@/messages";

// Static, refreshed hourly: Firebase URLs and the latest posts are baked in.
export const revalidate = 3600;

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isLocale(lang)) notFound();
  const t = getMessages(lang);
  const [home, posts] = await Promise.all([
    getHomeData(),
    getLatestPosts(lang),
  ]);
  // A project's name and link from the config, its words in this language.
  const project = (id: keyof typeof projects) => ({
    ...projects[id],
    ...t.projects[id],
  });

  // Order matters: cards pack first-fit in this order. Sizes are columns × rows
  // on phones (2 columns, below the hero's header row), wide phones (2), small
  // tablets (2), tablets (3), and desktops (4).
  // On tablets:
  //   [hero      ][sky  ]
  //   [hero      ][globe]
  //   [finops           ]
  //   [artifacts        ]
  //   [secondself][pack ]
  //   [photos    ][pack ]
  //   [photos    ][web  ]
  //   [chatbot   ][web  ]
  //   [tech][mini][emoji]
  //   [paper][writing   ]
  // On desktop:
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
      label: t.cards.hero,
      size: [
        [2, 1],
        [2, 2],
        [2, 2],
        [2, 2],
        [2, 2],
      ],
      still: true,
      // Below 768px a full-width header row as tall as its content (the first
      // three sizes go unused).
      header: true,
      content: (
        <HeroCard avatarUrl={home.avatarUrl} dogUrl={home.dogUrl} lang={lang} />
      ),
    },
    {
      id: "finops",
      tags: ["work"],
      label: "AWS FinOps Agent",
      size: [
        [2, 2],
        [2, 2],
        [2, 1],
        [3, 1],
        [2, 1],
      ],
      content: <FinOpsCard />,
    },
    {
      id: "artifacts",
      tags: ["work"],
      label: "Amazon Q artifacts",
      size: [
        [2, 2],
        [2, 2],
        [2, 1],
        [3, 1],
        [2, 1],
      ],
      content: <ArtifactsCard />,
    },
    {
      id: "sky",
      tags: ["about"],
      label: t.cards.sky,
      size: [
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
      ],
      content: <SkyCard />,
    },
    {
      id: "globe",
      tags: ["about"],
      label: t.cards.globe,
      size: [
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
      ],
      content: <GlobeCard />,
    },
    {
      id: "secondself",
      tags: ["work"],
      label: projects.secondself.name,
      size: [
        [2, 1],
        [2, 1],
        [2, 1],
        [2, 1],
        [2, 1],
      ],
      content: (
        <ProjectCard
          image={secondselfShot}
          look="secondself"
          lang={lang}
          project={project("secondself")}
        />
      ),
    },
    {
      id: "packbook",
      tags: ["work"],
      label: "PackBook",
      size: [
        [2, 2],
        [2, 2],
        [1, 2],
        [1, 2],
        [1, 2],
      ],
      content: <PackBookCard />,
    },
    {
      id: "photos",
      tags: ["about"],
      label: t.cards.photos,
      size: [
        [2, 2],
        [2, 2],
        [2, 2],
        [2, 2],
        [2, 2],
      ],
      content: <PhotoDeck photos={home.photos} />,
    },
    {
      id: "webagent",
      tags: ["work"],
      label: projects.webagent.name,
      size: [
        [1, 2],
        [1, 2],
        [1, 2],
        [1, 2],
        [1, 2],
      ],
      content: (
        <ProjectCard
          height={800}
          image={home.webagentUrl}
          look="webagent"
          lang={lang}
          project={project("webagent")}
          width={1000}
        />
      ),
    },
    {
      id: "chatbot",
      tags: ["work"],
      label: projects.chatbot.name,
      size: [
        [2, 1],
        [2, 1],
        [2, 1],
        [2, 1],
        [2, 1],
      ],
      content: (
        <ProjectCard
          height={1280}
          image={home.chatbotUrl}
          look="chatbot"
          lang={lang}
          project={project("chatbot")}
          width={2629}
        />
      ),
    },
    {
      id: "tech",
      tags: ["about", "work"],
      label: t.cards.tech,
      size: [
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
      ],
      content: <TechSphere />,
    },
    {
      id: "mini",
      tags: ["about"],
      label: t.cards.mini,
      size: [
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
      ],
      content: <MiniCard />,
    },
    {
      id: "emoji",
      tags: ["work"],
      label: t.cards.emoji,
      size: [
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
      ],
      content: <EmojiCard />,
    },
    {
      id: "paper",
      tags: ["work"],
      label: projects.paper.name,
      size: [
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
      ],
      content: (
        <ProjectCard
          height={1280}
          image={home.paperUrl}
          look="paper"
          lang={lang}
          project={project("paper")}
          width={1577}
        />
      ),
    },
    {
      id: "writing",
      tags: ["about"],
      label: t.cards.writing,
      size: [
        [2, 2],
        [2, 2],
        [2, 1],
        [2, 1],
        [2, 1],
      ],
      content: <WritingCard lang={lang} posts={posts} />,
    },
  ];

  return <BentoGrid items={items} />;
}
