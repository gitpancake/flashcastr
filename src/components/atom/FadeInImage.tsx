"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export const FadeInImage = ({ className = "", src, alt, ...props }: ImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`${className} absolute inset-0 flex items-center justify-center bg-gray-900 text-gray-600 text-[10px] uppercase tracking-wider`}
      >
        No Image
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
    />
  );
};
