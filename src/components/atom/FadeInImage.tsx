"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export const FadeInImage = ({ className = "", ...props }: ImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Image
      {...props}
      className={`${className} transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
      onLoad={() => setIsLoaded(true)}
    />
  );
};
