"use client";

import { Button } from "@nextui-org/button";
import { Dispatch, FC, SetStateAction } from "react";
import { FaMagic } from "react-icons/fa";
import { FaImage } from "react-icons/fa6";

import { cn } from "@/lib/utils";

export interface AnimationSwitchProps {
  className?: string;
  animated: boolean;
  setAnimated: Dispatch<SetStateAction<boolean>>;
}

export const AnimationSwitch: FC<AnimationSwitchProps> = ({
  className,
  animated,
  setAnimated,
}) => {
  const onChange = () => {
    setAnimated((prev) => !prev);
  };

  return (
    <div className={cn(className)}>
      {!animated ? (
        <Button
          isIconOnly
          className="dark:border-knight dark:bg-transparent dark:border-2 bg-midnight border-0"
          radius="full"
          variant="bordered"
          onPress={onChange}
        >
          <FaMagic size={16} />
        </Button>
      ) : (
        <Button
          isIconOnly
          className="dark:border-knight dark:bg-transparent dark:border-2 bg-midnight border-0"
          radius="full"
          variant="bordered"
          onPress={onChange}
        >
          <FaImage size={16} />
        </Button>
      )}
    </div>
  );
};
