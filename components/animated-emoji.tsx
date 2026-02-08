"use client";
import { Button } from "@heroui/button";
import Image from "next/image";
import { Input } from "@heroui/input";
import { useState } from "react";
import { default as emojiMap } from "unicode-emoji-json";
import { HashLoader } from "react-spinners";

import { fuzzySearch } from "@/lib/fuzzySearch";
import { Emoji } from "@/types/emoji";
import { wavingHand } from "@/lib/emojis";

const AnimatedEmoji = () => {
  const [prompt, setPrompt] = useState<string>("Hello");
  const [loading, setLoading] = useState<boolean>(false);
  const [emoji, setEmoji] = useState<Emoji>(wavingHand);

  return (
    <div className="w-full h-full p-4 flex flex-col justify-between items-center">
      {loading ? (
        <div className="flex h-full w-full justify-center items-center">
          <HashLoader color="#eef0f7" size={50} />
        </div>
      ) : (
        <Image alt="Animated Emoji" height={150} src={emoji.url} width={150} />
      )}
      <div className="w-full space-y-3 flex flex-col items-center justify-center">
        <Input
          className="w-[95%]"
          classNames={{
            inputWrapper: "border-midnight dark:border-knight",
            label: "text-gray-400",
          }}
          label="Enter text, get emoji!"
          radius="lg"
          variant="underlined"
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
          onValueChange={(value) => {
            setPrompt(value);
          }}
        />
        <Button
          className="w-full border-midnight dark:border-knight"
          radius="full"
          variant="bordered"
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
          onPress={async () => {
            setLoading(true);
            const response = await fetch("/api/emoji", {
              method: "POST",
              body: JSON.stringify({ prompt }),
              headers: {
                "Content-Type": "application/json",
              },
            });
            const data = await response.json();
            const emojiEntry =
              emojiMap[`${data.result}` as keyof typeof emojiMap];

            if (emojiEntry) {
              const searchedResult = fuzzySearch(emojiEntry.name);
              if (searchedResult) {
                setEmoji(searchedResult);
              }
            }
            setLoading(false);
          }}
        >
          Generate
        </Button>
      </div>
    </div>
  );
};

export default AnimatedEmoji;
