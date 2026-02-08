"use client";

import { Tab, Tabs } from "@heroui/react";
import { Responsive } from "react-grid-layout";
import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { HashLoader } from "react-spinners";

import Paper from "./paper";

import { cn } from "@/lib/utils";
import AvatarTransition from "@/components/avatar";
import { DockDemo } from "@/components/dock-demo";
import { ThemeSwitch } from "@/components/theme-switch";
import MiniPic from "@/components/mini-pic";
import Actions from "@/components/actions";
import { layouts, selectedCard } from "@/config/layout";
import { icons } from "@/config/icons";
import useWindowWidth from "@/hooks/useWindowWidth";

const LoadingPlaceholder = () => (
  <div className="w-full h-full flex justify-center items-center">
    <HashLoader color="#eef0f7" size={50} />
  </div>
);

// Lazy load heavy client components with next/dynamic
// These components use browser APIs (WebGL, Mapbox) so ssr: false is required
const IconCloud = dynamic(() => import("@/components/icon-cloud"), {
  ssr: false,
  loading: LoadingPlaceholder,
});

const MapComponent = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: LoadingPlaceholder,
});

// Named export requires .then(mod => mod.Name)
const MiniModel = dynamic(
  () => import("@/components/mini").then((mod) => mod.MiniModel),
  {
    ssr: false,
    loading: LoadingPlaceholder,
  },
);

// Lazy load for code splitting, but allow SSR (these don't need browser APIs)
const AnimatedEmoji = dynamic(() => import("@/components/animated-emoji"), {
  loading: LoadingPlaceholder,
});

const CardStack = dynamic(() => import("@/components/card-stack"), {
  loading: LoadingPlaceholder,
});

const WebAgent = dynamic(() => import("@/components/webagent"), {
  loading: LoadingPlaceholder,
});

const Chatbot = dynamic(() => import("@/components/chatbot"), {
  loading: LoadingPlaceholder,
});

interface HomeClientProps {
  photos: string[];
  avatarUrl: string;
  dogUrl: string;
  actionImageUrl: string;
  resumeUrl: string;
  webagentUrl: string;
  chatbotUrl: string;
  paperUrl: string;
}

export default function HomeClient({
  photos,
  avatarUrl,
  dogUrl,
  actionImageUrl,
  resumeUrl,
  webagentUrl,
  chatbotUrl,
  paperUrl,
}: HomeClientProps) {
  const { width, ready } = useWindowWidth();
  const [tabSelected, setTabSelected] = useState("all");
  const [, startTransition] = useTransition();
  const router = useRouter();
  const [show3D, setShow3D] = useState(false);

  const handleMiniClick = useCallback(() => {
    setShow3D(true);
  }, []);

  useEffect(() => {
    router.prefetch("/blog");
  }, [router]);

  return (
    <div className="flex justify-center flex-col items-center">
      <Tabs
        aria-label="Tabs"
        className="mb-2 md:mb-6 rounded-full"
        classNames={{
          cursor: "shadow-none",
          tabList:
            "bg-[#ece7e7] dark:bg-darkBg border-2 border-transparent dark:border-knight rounded-full",
        }}
        radius={"full"}
        onSelectionChange={(selected) => {
          if (selected === "blog") {
            startTransition(() => {
              router.push("/blog");
            });
            return;
          }
          setTabSelected(selected as string);
        }}
      >
        <Tab key="all" title="All" />
        <Tab key="about" title="About" />
        <Tab key="projects" title="Projects" />
        <Tab key="blog" title="Blog" />
      </Tabs>

      <Responsive
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        className={cn(
          "layout w-full h-full transition-opacity duration-300",
          ready ? "opacity-100" : "opacity-0",
        )}
        cols={{ lg: 4, md: 4, sm: 2, xs: 2, xxs: 2 }}
        layouts={layouts[tabSelected]}
        margin={[15, 15]}
        width={width}
      >
        <div
          key="avatar"
          className={cn(
            "bg-white dark:bg-darkBg border-2 border-transparent dark:border-knight cursor-grab active:cursor-grabbing rounded-[2rem] flex flex-col justify-between p-5 overflow-hidden z-[1]",
            selectedCard[tabSelected]["avatar"] ? "opacity-100" : "opacity-50",
          )}
        >
          <AvatarTransition avatarUrl={avatarUrl} dogUrl={dogUrl} />
          <p className="text-sm md:text-medium">
            Hey! I&apos;m <span className="font-oleo text-2xl"> Eric</span>, a
            SDE at AWS building agentic systems and generative UI. UCLA &amp;
            Purdue alum. Passionate about crafting AI experiences that make
            life easier. Outside work, I&apos;m hiking with my dog Bert and
            planning to summit Mount Rainier in 2027!
          </p>
          <DockDemo resumeUrl={resumeUrl} />
        </div>
        <div
          key="themeSwitch"
          className={cn(
            "bg-white dark:bg-darkBg border-2 border-transparent dark:border-knight cursor-grab active:cursor-grabbing rounded-[2rem] flex justify-center items-center z-[1]",
            selectedCard[tabSelected]["themeSwitch"]
              ? "opacity-100"
              : "opacity-50",
          )}
        >
          <ThemeSwitch />
        </div>
        <div
          key="cardStack"
          className={cn(
            "bg-white dark:bg-darkBg border-2 border-transparent dark:border-knight cursor-grab active:cursor-grabbing rounded-[2rem] flex justify-center items-center z-[2]",
            selectedCard[tabSelected]["cardStack"]
              ? "opacity-100"
              : "opacity-50",
          )}
        >
          <CardStack photos={photos} />
        </div>
        <div
          key="animatedEmoji"
          className={cn(
            "bg-white dark:bg-darkBg border-2 border-transparent dark:border-knight cursor-grab active:cursor-grabbing rounded-[2rem] flex justify-center items-center z-[1]",
            selectedCard[tabSelected]["animatedEmoji"]
              ? "opacity-100"
              : "opacity-50",
          )}
        >
          <AnimatedEmoji />
        </div>
        <div
          key="mapComponent"
          className={cn(
            "bg-white dark:bg-darkBg cursor-grab active:cursor-grabbing rounded-[2rem] flex justify-center items-center z-[1]",
            selectedCard[tabSelected]["mapComponent"]
              ? "opacity-100"
              : "opacity-50",
          )}
        >
          <MapComponent />
        </div>
        <div
          key="iconCloud"
          className={cn(
            "bg-white dark:bg-darkBg border-2 border-transparent dark:border-knight cursor-grab active:cursor-grabbing rounded-[2rem] flex justify-center items-center relative overflow-hidden p-10 md:p-8 z-[1]",
            selectedCard[tabSelected]["iconCloud"]
              ? "opacity-100"
              : "opacity-50",
          )}
        >
          <IconCloud iconSlugs={icons} />
        </div>
        <div
          key="webAgent"
          className={cn(
            "bg-white dark:bg-darkBg dark:border-2 dark:border-knight cursor-grab active:cursor-grabbing rounded-[2rem] flex justify-center items-center overflow-hidden z-[1]",
            selectedCard[tabSelected]["webAgent"]
              ? "opacity-100"
              : "opacity-50",
          )}
        >
          <WebAgent webAgentUrl={webagentUrl} />
        </div>
        <div
          key="chatBot"
          className={cn(
            "bg-white dark:bg-darkBg dark:border-2 dark:border-knight cursor-grab active:cursor-grabbing rounded-[2rem] flex justify-center items-center overflow-hidden z-[1]",
            selectedCard[tabSelected]["chatBot"] ? "opacity-100" : "opacity-50",
          )}
        >
          <Chatbot chatbotUrl={chatbotUrl} />
        </div>
        <div
          key="miniModel"
          className={cn(
            "bg-white dark:bg-darkBg border-2 border-transparent dark:border-knight cursor-grab active:cursor-grabbing rounded-[2rem] flex justify-center items-center z-[1] overflow-hidden",
            selectedCard[tabSelected]["miniModel"]
              ? "opacity-100"
              : "opacity-50",
          )}
        >
          {show3D ? (
            <MiniModel />
          ) : (
            <MiniPic onClick={handleMiniClick} showOverlay />
          )}
        </div>
        <div
          key="actions"
          className={cn(
            "bg-white dark:bg-darkBg dark:border-2 dark:border-knight cursor-grab active:cursor-grabbing rounded-[2rem] flex justify-center items-center overflow-hidden z-[1]",
            selectedCard[tabSelected]["actions"] ? "opacity-100" : "opacity-50",
          )}
        >
          <Actions photoUrl={actionImageUrl} />
        </div>
        <div
          key="paper"
          className={cn(
            "bg-white dark:bg-darkBg dark:border-2 dark:border-knight cursor-grab active:cursor-grabbing rounded-[2rem] flex justify-center items-center z-[1] overflow-hidden",
            selectedCard[tabSelected]["paper"] ? "opacity-100" : "opacity-50",
          )}
        >
          <Paper paperUrl={paperUrl} />
        </div>
      </Responsive>
    </div>
  );
}
