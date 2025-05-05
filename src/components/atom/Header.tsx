"use client";

import Image from "next/image";

export const Header = () => {
  return (
    <div className="flex w-full justify-between items-center bg-black px-4">
      <Image src="/splash.png" width={1920} height={1080} alt="Flashcastr" className="h-[60px] w-[60px]" />
      <div>
        <button className="bg-[#8A63D2] py-[2px] px-[10px]">
          <p className="text-white text-[18px] font-invader tracking-wider">Connect</p>
        </button>
      </div>
    </div>
  );
};
