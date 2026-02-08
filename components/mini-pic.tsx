import { useTheme } from "next-themes";
import { Image } from "@heroui/react";

interface MiniPicProps {
  onClick?: () => void;
  showOverlay?: boolean;
}

const MiniPic = ({ onClick, showOverlay = false }: MiniPicProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="relative w-full h-full cursor-pointer" onClick={onClick}>
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
      {showOverlay && (
        <div className="absolute inset-0 flex items-end justify-center pb-4 z-10">
          <span className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
            Click for 3D
          </span>
        </div>
      )}
    </div>
  );
};

export default MiniPic;
