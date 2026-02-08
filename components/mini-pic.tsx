import { Image } from "@heroui/react";
import { useRef } from "react";

interface MiniPicProps {
  onClick?: () => void;
  showOverlay?: boolean;
}

const MiniPic = ({ onClick, showOverlay = false }: MiniPicProps) => {
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const handleStart = (x: number, y: number) => {
    startPos.current = { x, y };
  };

  const handleEnd = (x: number, y: number) => {
    if (!startPos.current) return;
    const dx = Math.abs(x - startPos.current.x);
    const dy = Math.abs(y - startPos.current.y);
    if (dx < 5 && dy < 5) {
      onClick?.();
    }
    startPos.current = null;
  };

  return (
    <div
      className="relative w-full h-full cursor-pointer"
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseUp={(e) => handleEnd(e.clientX, e.clientY)}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={(e) => handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
    >
      <Image
        alt="Mini Cooper"
        classNames={{
          wrapper: "!max-w-none w-full h-full",
          img: "w-full h-full object-contain",
        }}
        radius="none"
        src="mini.png"
      />
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
