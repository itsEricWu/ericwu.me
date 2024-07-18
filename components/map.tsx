import React, { useEffect, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useTheme } from "next-themes";
import Image from "next/image";

const MapComponent: React.FC = () => {
  const { theme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const style = useMemo(() => {
    return theme === "dark"
      ? "mapbox://styles/mapbox/dark-v10"
      : "mapbox://styles/mapbox/standard";
  }, [theme]);

  useEffect(() => {
    const map = new mapboxgl.Map({
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
      container: mapContainerRef.current as HTMLElement,
      style: style,
      center: [-118.4438, 34.0699],
      zoom: 10,
    });

    return () => map.remove(); // Cleanup on unmount
  }, [style]);

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            flex items-center justify-center
            w-14 h-14 md:w-20 md:h-20 rounded-full 
            shadow-lg cursor-pointer bg-blue-400 bg-opacity-40 border-2 md:border-4 border-white border-opacity-80 hover:animate-pulse"
      >
        <Image
          alt="Icon"
          className="w-8 h-8 md:w-10 md:h-10"
          height={300}
          src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Hugging%20Face.png"
          width={300}
        />
      </div>
    </div>
  );
};

export default MapComponent;
