import { useState, useEffect } from "react";

function useWindowWidth(): number | undefined {
  // Initialize width as undefined to indicate that the window size is not yet determined
  const [width, setWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

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
