"use client";

import { useTheme } from "next-themes";
import { ExtendedRecordMap } from "notion-types";
import { useEffect, useMemo, useState } from "react";
import { NotionRenderer } from "react-notion-x";
import dynamic from "next/dynamic";
import { Button } from "@nextui-org/button";
import { RxCross2 } from "react-icons/rx";
import Link from "next/link";

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
    import("react-notion-x/build/third-party/code").then(async (m) => {
      const importPromises = prismComponents.map(
        (component) => import(`prismjs/components/${component}.js`)
      );

      await Promise.allSettled(importPromises);

      return m.Code;
    }),
  {
    ssr: false,
  }
);

const Collection = dynamic(
  () =>
    import("react-notion-x/build/third-party/collection").then(
      (m) => m.Collection
    ),
  {
    ssr: false,
  }
);
const Equation = dynamic(() =>
  import("react-notion-x/build/third-party/equation").then((m) => m.Equation)
);
const Pdf = dynamic(
  () => import("react-notion-x/build/third-party/pdf").then((m) => m.Pdf),
  {
    ssr: false,
  }
);
const Modal = dynamic(
  () => import("react-notion-x/build/third-party/modal").then((m) => m.Modal),
  {
    ssr: false,
  }
);

export const NotionPage = ({
  recordMap,
  rootPageId,
  title,
}: {
  recordMap: ExtendedRecordMap;
  rootPageId: string;
  title?: string;
}) => {
  const [isClient, setIsClient] = useState(false);
  const { theme } = useTheme();
  const [hover, setHover] = useState(false);

  const components = useMemo(
    () => ({
      Code,
      Collection,
      Equation,
      Pdf,
      Modal,
    }),
    []
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (!recordMap) {
    return null;
  }

  return (
    <>
      <Link className="self-center" href="/blog">
        <Button
          isIconOnly
          className="dark:border-knight dark:bg-transparent dark:border-2 bg-[#ece7e7] border-0"
          radius="full"
          variant="bordered"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <RxCross2 />
        </Button>
      </Link>
      <div
        className={`transition duration-700 ease-in-out transform ${hover ? "translate-y-5" : ""}`}
      >
        <h1 className="my-4 text-center text-xl font-bold md:text-2xl">
          {title}
        </h1>
        <div className="ml-[15px] md:mx-[296px] mb-4">
          <h3 className="w-fit dark:border-knight dark:bg-transparent dark:border-2 bg-[#ece7e7] border-0 py-1 px-4 rounded-full">
            {new Date(
              recordMap.block[rootPageId].value?.created_time
            ).toDateString()}
          </h3>
        </div>

        <NotionRenderer
          components={components}
          darkMode={theme === "dark"}
          fullPage={false}
          recordMap={recordMap}
          rootPageId={rootPageId}
        />
      </div>
    </>
  );
};
