"use client";

import { FC, useEffect, useState } from "react";
import { Switch } from "@heroui/switch";
import { useTheme } from "next-themes";
import clsx from "clsx";

import { SunIcon, MoonIcon } from "@/components/icons";

export interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isLight = theme === "light";

  return (
    <div className="border-2 border-transparent dark:border-knight rounded-full">
      <Switch
        className={clsx(
          "transition-opacity hover:opacity-80 cursor-pointer",
          className,
        )}
        classNames={{
          wrapper:
            "w-[4.5rem] h-10 group-data-[selected=true]:bg-midnight bg-[#1e2228]",
          thumb: "w-8 h-8 group-data-[selected=true]:ms-8",
          base: "w-[4.5rem] h-10",
          thumbIcon: "w-5 h-5",
        }}
        isSelected={isLight}
        thumbIcon={({ isSelected, className: iconClassName }) =>
          isSelected ? (
            <SunIcon className={iconClassName} />
          ) : (
            <MoonIcon className={iconClassName} />
          )
        }
        onValueChange={(selected) => setTheme(selected ? "light" : "dark")}
      />
    </div>
  );
};
