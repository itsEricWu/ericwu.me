import Image, { type StaticImageData } from "next/image";

import { ArrowUpRight } from "./ui";

import type { Project } from "@/config/site";
import { cn } from "@/lib/utils";

/*
 * Each composition keeps the original, hand-tuned placement: a pastel card,
 * a soft pink blob, and the screenshot tilted -30°. On top of that the
 * screenshot leans toward the cursor (the grid feeds --tx/--ty), lifts on
 * hover, and gets a liquid-glass loupe.
 */
const LOOKS = {
  secondself: {
    bg: "bg-sky",
    blob: "-bottom-32 left-1/2 h-56 w-64 -translate-x-1/2 md:-bottom-52 md:h-96 md:w-96",
    shot: "top-16 left-20 w-[80%] -translate-y-1/2 md:top-36 md:left-44",
    img: "h-full w-full object-contain",
    sizes: "(max-width: 768px) 300px, 500px",
  },
  webagent: {
    bg: "bg-mint",
    blob: "-bottom-96 left-16 h-full w-[145%]",
    shot: "top-1/2 left-24 w-[80%] -translate-y-1/2 md:left-32",
    img: "h-full w-full object-contain",
    sizes: "(max-width: 768px) 300px, 500px",
  },
  chatbot: {
    bg: "bg-butter",
    blob: "-top-40 left-40 h-full w-[135%]",
    shot: "top-1/2 left-20 w-[400px] -translate-y-1/2 md:left-44 md:w-[800px]",
    img: "h-48 object-cover md:h-96",
    sizes: "(max-width: 768px) 400px, 800px",
  },
  paper: {
    bg: "bg-butter",
    blob: "-top-40 left-40 h-full w-[135%]",
    shot: "top-16 left-12 w-full -translate-y-1/2 md:top-1/2 md:left-16",
    img: "h-full w-full object-contain",
    sizes: "(max-width: 768px) 300px, 500px",
  },
} as const;

export function ProjectCard({
  project,
  look,
  image,
  width,
  height,
}: {
  project: Project;
  look: keyof typeof LOOKS;
  /** A local import (sized automatically) or a remote URL with its size. */
  image: string | StaticImageData;
  width?: number;
  height?: number;
}) {
  const l = LOOKS[look];

  return (
    <div className={cn("group relative h-full w-full overflow-hidden", l.bg)}>
      <div
        className={cn("absolute rounded-full bg-blush dark:hidden", l.blob)}
      />
      <div
        className={cn(
          "absolute rounded-2xl -rotate-[30deg] transition-[rotate,scale,translate] duration-700 ease-[cubic-bezier(.2,.9,.25,1)] [transform:perspective(1100px)_rotateX(calc(var(--ty,0)*-6deg))_rotateY(calc(var(--tx,0)*8deg))] group-hover:scale-[1.03] group-hover:-rotate-[27deg]",
          l.shot,
        )}
        data-lens
      >
        <Image
          alt={`${project.name}: ${project.blurb}`}
          className={cn(
            "rounded-2xl shadow-[0_24px_48px_-24px_rgb(0_0_0/0.45)]",
            l.img,
          )}
          height={height}
          placeholder={typeof image === "string" ? "empty" : "blur"}
          quality={65}
          sizes={l.sizes}
          src={image}
          width={width}
        />
      </div>

      {/* The original expanding link, now in liquid glass. */}
      <a
        aria-label={`${project.name}: ${project.blurb}`}
        className="lg absolute bottom-2 left-2 z-10 flex h-10 max-w-10 items-center overflow-hidden rounded-full p-0 transition-[max-width] duration-500 ease-[cubic-bezier(.2,.9,.25,1)] group-hover:max-w-[calc(100%-1rem)] focus-visible:max-w-[calc(100%-1rem)] md:h-11 md:max-w-11"
        data-cursor={`Open ${project.linkLabel} ↗`}
        href={project.href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <span aria-hidden className="lg-caustic" />
        <span className="grid size-10 shrink-0 place-items-center md:size-11">
          <ArrowUpRight className="size-4" />
        </span>
        <span className="pr-4 text-[13px] font-medium whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 md:text-[14px]">
          {project.name}
        </span>
      </a>
    </div>
  );
}
