import { useState, useEffect } from "react";

// Default to 1280 (max container width) for SSR so server renders meaningful HTML
const SSR_DEFAULT_WIDTH = 1280;

function useWindowWidth(): { width: number; settled: boolean } {
  const [width, setWidth] = useState<number>(SSR_DEFAULT_WIDTH);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWidth(Math.min(window.innerWidth, 1280));
    };

    // Set correct width immediately
    handleResize();

    // Wait for the layout to paint with the correct width, then reveal
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSettled(true);
      });
    });

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { width, settled };
}

export default useWindowWidth;
