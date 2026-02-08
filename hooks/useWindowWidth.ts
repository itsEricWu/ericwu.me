import { useState, useEffect } from "react";

// Default to 1280 (max container width) for SSR so server renders meaningful HTML
const SSR_DEFAULT_WIDTH = 1280;

function useWindowWidth(): { width: number; ready: boolean } {
  const [width, setWidth] = useState<number>(SSR_DEFAULT_WIDTH);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWidth(Math.min(window.innerWidth, 1280));
    };

    handleResize();
    setReady(true);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { width, ready };
}

export default useWindowWidth;
