import Link from "next/link";

import { AvatarFlip } from "./avatar-flip";
import { HeroTitle } from "./hero-title";

import { siteConfig } from "@/config/site";

const socials = [
  {
    label: "GitHub",
    href: siteConfig.links.github,
    path: "M8 .2a8 8 0 0 0-2.5 15.6c.4 0 .5-.2.5-.4v-1.5c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.5 7.5 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.8-3.6 4 .3.3.6.8.6 1.5v2.2c0 .2.1.5.6.4A8 8 0 0 0 8 .2Z",
  },
  {
    label: "LinkedIn",
    href: siteConfig.links.linkedin,
    path: "M13.6 13.6h-2.4V9.9c0-.9 0-2-1.2-2s-1.4.9-1.4 1.9v3.8H6.2V6h2.3v1h.1c.3-.6 1.1-1.2 2.3-1.2 2.4 0 2.8 1.6 2.8 3.6v4.2ZM3.5 4.9a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Zm1.2 8.7H2.3V6h2.4v7.6ZM14.8 0H1.2C.5 0 0 .5 0 1.2v13.6c0 .7.5 1.2 1.2 1.2h13.6c.7 0 1.2-.5 1.2-1.2V1.2c0-.7-.5-1.2-1.2-1.2Z",
  },
  {
    label: "Email",
    href: siteConfig.links.email,
    path: "M1.5 3h13c.8 0 1.5.7 1.5 1.5v7c0 .8-.7 1.5-1.5 1.5h-13C.7 13 0 12.3 0 11.5v-7C0 3.7.7 3 1.5 3Zm.3 1.6L8 8.8l6.2-4.2H1.8Zm12.6 1.5L8.4 10.2a.8.8 0 0 1-.8 0L1.6 6.1v5.3h12.8V6.1Z",
  },
];

export function HeroCard({
  avatarUrl,
  dogUrl,
}: {
  avatarUrl: string;
  dogUrl: string;
}) {
  return (
    <div className="relative flex h-full flex-col justify-between p-5 [container:hero/inline-size] min-[480px]:[container:hero/size] sm:p-6">
      <div className="flex items-center gap-3.5">
        <AvatarFlip avatarUrl={avatarUrl} dogUrl={dogUrl} />
        <div className="leading-tight">
          <p className="text-[15px] font-semibold tracking-[-0.01em]">
            Eric Wu
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[13px] text-muted">
            <svg
              aria-hidden
              className="size-3"
              fill="currentColor"
              viewBox="0 0 12 12"
            >
              <path d="M10.9 1.1a.5.5 0 0 0-.53-.12L1.3 4.5a.5.5 0 0 0 .02.94l3.6 1.1 1.1 3.6a.5.5 0 0 0 .94.02l3.52-9.07a.5.5 0 0 0-.12-.53Z" />
            </svg>
            Seattle, WA
          </p>
        </div>
      </div>
      {/* Byline, statement, and links share any spare height evenly. On phones
          the card is as tall as its content, so they sit at these minimum gaps. */}
      <div className="pt-5 min-[480px]:pt-6">
        <HeroTitle />
        <p className="mt-4 max-w-[32em] text-[16px] leading-[1.5] text-pretty text-muted @max-[270px]/hero:text-[15px] min-[480px]:text-[17px] lg:mt-5 lg:text-[19px]">
          An SDE II at AWS building agentic systems and generative UI. UCLA
          &amp; Purdue alum. Passionate about crafting AI experiences that make
          life easier. Outside work, I&apos;m hiking with my dog Bert and
          planning to summit Mount Rainier in 2027!
        </p>
      </div>
      <nav
        aria-label="Social links"
        className="dock mt-6 flex items-center gap-2 lg:mt-7"
      >
        {socials.map((s) => (
          <a
            key={s.label}
            aria-label={s.label}
            className="lg grid size-10 place-items-center rounded-full transition-[scale,translate] duration-300 ease-out @max-[270px]/hero:size-9"
            data-cursor={s.label}
            href={s.href}
            rel="noopener noreferrer"
            target={s.href.startsWith("http") ? "_blank" : undefined}
          >
            <span aria-hidden className="lg-caustic" />
            <svg
              aria-hidden
              className="size-4"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d={s.path} />
            </svg>
          </a>
        ))}
        <Link
          className="lg ml-1 inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-medium transition-[scale] duration-300 hover:scale-[1.04] @max-[270px]/hero:h-9 @max-[270px]/hero:px-3.5"
          data-cursor="Writing"
          href="/blog"
        >
          <span aria-hidden className="lg-caustic" />
          Read my blog
        </Link>
      </nav>
    </div>
  );
}
