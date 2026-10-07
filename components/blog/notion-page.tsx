"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "next-themes";
import type { ExtendedRecordMap } from "notion-types";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { NotionRenderer } from "react-notion-x";

import { useLocale, useT } from "@/components/locale-provider";
import { formatDate, localePath } from "@/lib/i18n";

const prismComponents = [
  "prism-markup-templating",
  "prism-markup",
  "prism-bash",
  "prism-c",
  "prism-cpp",
  "prism-csharp",
  "prism-docker",
  "prism-java",
  "prism-js-templates",
  "prism-coffeescript",
  "prism-diff",
  "prism-git",
  "prism-go",
  "prism-graphql",
  "prism-handlebars",
  "prism-less",
  "prism-makefile",
  "prism-markdown",
  "prism-objectivec",
  "prism-ocaml",
  "prism-python",
  "prism-reason",
  "prism-rust",
  "prism-sass",
  "prism-scss",
  "prism-solidity",
  "prism-sql",
  "prism-stylus",
  "prism-swift",
  "prism-wasm",
  "prism-yaml",
];

const Code = dynamic(
  () =>
    import("react-notion-x/third-party/code").then(async (m) => {
      await Promise.allSettled(
        prismComponents.map(
          (component) => import(`prismjs/components/${component}.js`),
        ),
      );

      return m.Code;
    }),
  { ssr: false },
);

const Collection = dynamic(
  () =>
    import("react-notion-x/third-party/collection").then((m) => m.Collection),
  { ssr: false },
);

const Equation = dynamic(() =>
  import("react-notion-x/third-party/equation").then((m) => m.Equation),
);

const Pdf = dynamic(
  () => import("react-notion-x/third-party/pdf").then((m) => m.Pdf),
  {
    ssr: false,
  },
);

const Modal = dynamic(
  () => import("react-notion-x/third-party/modal").then((m) => m.Modal),
  { ssr: false },
);

const noSubscribe = () => () => {};

export const NotionPage = ({
  recordMap,
  rootPageId,
  title,
  created,
  notice,
}: {
  recordMap: ExtendedRecordMap;
  rootPageId: string;
  title?: string;
  /** When the post was first published (a translation keeps its original's date). */
  created?: number;
  /** A note above the body, e.g. that it hasn't been translated yet. */
  notice?: string;
}) => {
  const lang = useLocale();
  const { blog } = useT();
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
  const components = useMemo(
    () => ({ Code, Collection, Equation, Pdf, Modal }),
    [],
  );
  const articleRef = useRef<HTMLElement>(null);

  // Link previews show images from other sites, which come and go: drop the dead ones.
  useEffect(() => {
    const root = articleRef.current;

    if (!root) return;
    const onError = (e: Event) => {
      if (!(e.target instanceof HTMLImageElement)) return;
      const box = e.target.closest<HTMLElement>(
        ".notion-bookmark-link-icon, .notion-bookmark-image",
      );

      if (box) box.style.display = "none";
    };

    root.addEventListener("error", onError, true);
    // An image that failed before hydration is loaded again so its error is heard.
    root
      .querySelectorAll<HTMLImageElement>(".notion-bookmark img")
      .forEach((img) => {
        if (img.complete && img.naturalWidth === 0) {
          img.setAttribute("src", img.getAttribute("src") ?? "");
        }
      });

    return () => root.removeEventListener("error", onError, true);
  }, [recordMap]);

  if (!recordMap) {
    return null;
  }

  return (
    <article ref={articleRef} className="mx-auto max-w-[760px]" data-col="post">
      {/* Header and back link line up with the Notion body (its page padding plus the text's 2px). */}
      <Link
        className="lg ml-[calc(min(16px,8vw)_+_2px)] inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium"
        data-cursor={blog.backCursor}
        href={localePath(lang, "/blog")}
      >
        <span aria-hidden className="lg-caustic" />
        <span>{blog.back}</span>
      </Link>
      <header className="mt-8 mb-6 px-[calc(min(16px,8vw)_+_2px)]">
        {created && (
          <time className="eyebrow" dateTime={new Date(created).toISOString()}>
            {formatDate(lang, created, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        )}
        <h1 className="mt-3 font-display text-[clamp(2.1rem,4.8vw,3.2rem)] leading-[1.06] font-semibold tracking-[-0.018em] text-balance zh:leading-[1.3]">
          {title}
        </h1>
        {notice && <p className="mt-4 text-[14px] text-muted">{notice}</p>}
      </header>
      <div lang={notice ? "en" : undefined}>
        <NotionRenderer
          components={components}
          darkMode={mounted && resolvedTheme === "dark"}
          fullPage={false}
          recordMap={recordMap}
          rootPageId={rootPageId}
        />
      </div>
    </article>
  );
};
