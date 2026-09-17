"use client";

import Image from "next/image";

export const Loading = ({ fullScreen = false }: { fullScreen?: boolean }) => {
  return (
    <div className={`${fullScreen ? "h-screen" : "h-[75vh]"} w-screen bg-black flex justify-center items-center`}>
      <Image src="/splash.png" alt="Flashcastr" width={1920} height={1080} className="h-[120px] w-[120px] my-[-15px] animate-pulse" />
    </div>
  );
};
