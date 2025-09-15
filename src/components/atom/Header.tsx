"use client";

import Image from "next/image";
import Link from "next/link";
import { ProfileDropdown } from "../molecule/ProfileDropdown";

export const Header = () => {
  return (
    <div className="flex w-full justify-between items-center bg-black px-4">
      <Link href="/">
        <Image src="/splash.png" width={1920} height={1080} alt="Flashcastr" className="h-[60px] w-[60px]" />
      </Link>

      <ProfileDropdown />
    </div>
  );
};
