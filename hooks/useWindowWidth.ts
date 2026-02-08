import { useState, useEffect } from "react";

// Default to 1280 (max container width) for SSR so server renders meaningful HTML
const SSR_DEFAULT_WIDTH = 1280;

function useWindowWidth(): number {
  const [width, setWidth] = useState<number>(SSR_DEFAULT_WIDTH);

  useEffect(() => {
    const handleResize = () => {
      setWidth(Math.min(window.innerWidth, 1280));
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

export default useWindowWidth;
