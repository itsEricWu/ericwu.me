import { useTheme } from "next-themes";
import { Image } from "@heroui/react";
import { useRef } from "react";

interface MiniPicProps {
  onClick?: () => void;
  showOverlay?: boolean;
}

const MiniPic = ({ onClick, showOverlay = false }: MiniPicProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!startPos.current) return;
    const dx = Math.abs(e.clientX - startPos.current.x);
    const dy = Math.abs(e.clientY - startPos.current.y);
    // Only trigger click if mouse didn't move much (not a drag)
    if (dx < 5 && dy < 5) {
      onClick?.();
    }
    startPos.current = null;
  };

  return (
    <div
      className="relative w-full h-full cursor-pointer"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
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
        <div className="absolute inset-0 flex items-end justify-center pb-4 z-10 pointer-events-none">
          <span className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
            Click for 3D
          </span>
        </div>
      )}
    </div>
  );
};

export default MiniPic;
