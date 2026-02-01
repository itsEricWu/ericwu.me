"use client";

import { useState } from "react";
import NextImage, { ImageProps as NextImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface BlurImageProps extends NextImageProps {
  containerClassName?: string;
}

export function BlurImage({
  alt,
  src,
  className,
  containerClassName,
  ...rest
}: BlurImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn(
        "overflow-hidden",
        !loaded && "animate-pulse",
        containerClassName
      )}
    >
      <NextImage
        className={cn(
          "transition-[filter] duration-500 ease-out",
          loaded ? "blur-0" : "blur-md",
          className
        )}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        {...rest}
      />
    </div>
  );
}
