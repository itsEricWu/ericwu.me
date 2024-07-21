import { FC } from "react";
import { Switch } from "@nextui-org/switch"; // Adjusted import for the new switch
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import clsx from "clsx";

import { SunIcon, MoonIcon } from "@/components/icons"; // New icons

export interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className }) => {
  const { theme, setTheme } = useTheme();
  const isSSR = useIsSSR();

  const onChange = () => {
    theme === "light" ? setTheme("dark") : setTheme("light");
  };

  return (
    <div className="border-2 border-transparent dark:border-knight rounded-full">
      <Switch
        className={clsx(
          "transition-opacity hover:opacity-80 cursor-pointer",
          className
        )}
        classNames={{
          wrapper:
            "w-[4.5rem] h-10 group-data-[selected=true]:bg-midnight bg-[#1e2228]",
          thumb: "w-8 h-8 group-data-[selected=true]:ml-8",
          base: "w-[4.5rem] h-10",
          thumbIcon: "w-5 h-5",
        }}
        defaultSelected={theme === "light" || isSSR}
        thumbIcon={({ isSelected, className: iconClassName }) =>
          isSelected ? (
            <SunIcon className={iconClassName} />
          ) : (
            <MoonIcon className={iconClassName} />
          )
        }
        onChange={onChange}
      />
    </div>
  );
};
