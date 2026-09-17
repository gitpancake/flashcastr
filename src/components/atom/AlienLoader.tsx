"use client";

import Image from "next/image";

export const AlienLoader = () => {
  return (
    <div className="flex justify-center py-12">
      <Image src="/splash.png" alt="Loading" width={48} height={48} className="h-12 w-12 animate-pulse" />
    </div>
  );
};
