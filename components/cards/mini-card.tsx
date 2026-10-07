"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";

import mini from "@/assets/mini.png";

// three.js + drei only load once someone asks for the 3D car.
const MiniModel = dynamic(
  () => import("@/components/mini").then((m) => m.MiniModel),
  {
    ssr: false,
    loading: () => (
      <div className="grid size-full place-items-center">
        <span className="size-6 animate-spin rounded-full border-2 border-line border-t-glacier" />
      </div>
    ),
  },
);

export function MiniCard() {
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    const start = () => setShow3D(true);

    window.addEventListener("eric:mini", start);

    return () => window.removeEventListener("eric:mini", start);
  }, []);

  return (
    <div className="relative h-full">
      <p className="absolute top-4 left-5 z-10 text-[15px] font-semibold sm:top-5">
        My Mini
      </p>
      {show3D ? (
        <div className="absolute inset-0" data-nodrag>
          <MiniModel />
        </div>
      ) : (
        <button
          aria-label="Tap for 3D Mini Cooper model"
          className="group absolute inset-0"
          data-cursor="Start the engine"
          type="button"
          onClick={() => setShow3D(true)}
        >
          <span className="absolute inset-[18%] rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.14),transparent)] opacity-0 dark:opacity-100" />
          <Image
            alt="Black Mini Cooper"
            className="absolute inset-0 m-auto h-auto w-[78%] transition-transform duration-700 ease-[cubic-bezier(.2,.9,.25,1)] group-hover:-translate-y-1 group-hover:scale-[1.06] group-hover:-rotate-2"
            placeholder="blur"
            sizes="(max-width: 640px) 40vw, 240px"
            src={mini}
          />
          <span className="lg absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[12px] font-medium whitespace-nowrap">
            <span className="lg-caustic" />
            <span>Tap for 3D</span>
          </span>
        </button>
      )}
    </div>
  );
}
