import { useTheme } from "next-themes";
import { Image } from "@nextui-org/react";

const MiniPic = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div>
      {isDark ? (
        <Image
          alt="cover"
          className="rounded-b-none object-cover"
          src="mini-dark.jpg"
        />
      ) : (
        <Image
          alt="cover"
          className="rounded-b-none object-cover"
          src="mini-light.jpg"
        />
      )}
    </div>
  );
};

export default MiniPic;
