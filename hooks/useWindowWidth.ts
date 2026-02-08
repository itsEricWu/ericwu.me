import { useState, useEffect, useLayoutEffect } from "react";

// Default to 1280 (max container width) for SSR so server renders meaningful HTML
const SSR_DEFAULT_WIDTH = 1280;

function useWindowWidth(): { width: number; settled: boolean } {
  const [width, setWidth] = useState<number>(SSR_DEFAULT_WIDTH);
  const [settled, setSettled] = useState(false);

  // useLayoutEffect runs synchronously BEFORE browser paint,
  // so the user never sees the SSR layout with wrong width
  useLayoutEffect(() => {
    setWidth(Math.min(window.innerWidth, 1280));
    setSettled(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWidth(Math.min(window.innerWidth, 1280));
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { width, settled };
}

export default useWindowWidth;
