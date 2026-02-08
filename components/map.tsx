import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useTheme } from "next-themes";
import Image from "next/image";

const LIGHT_STYLE = "mapbox://styles/mapbox/standard";
const DARK_STYLE = "mapbox://styles/mapbox/dark-v10";

const MapComponent: React.FC = () => {
  const { theme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Create map once
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
      container: mapContainerRef.current as HTMLElement,
      style: theme === "dark" ? DARK_STYLE : LIGHT_STYLE,
      center: [-122.3321, 47.6062],
      zoom: 10,
    });

    map.on("load", () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Switch style without recreating the map
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(theme === "dark" ? DARK_STYLE : LIGHT_STYLE);
  }, [theme]);

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden">
      {!mapLoaded && (
        <Image
          alt="Map"
          className="w-full h-full object-cover"
          height={300}
          src="/map.jpg"
          width={300}
        />
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            flex items-center justify-center
            w-14 h-14 md:w-20 md:h-20 rounded-full
            shadow-lg cursor-pointer bg-blue-400/40 border-2 md:border-4 border-white/80 hover:animate-pulse"
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
