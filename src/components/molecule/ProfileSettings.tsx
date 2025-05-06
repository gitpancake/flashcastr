"use client";

import Image from "next/image";
import { FC, useState } from "react";
import { FiSettings } from "react-icons/fi";
import { UserWithoutSigner } from "~/lib/mongodb/users/types";
import { useFrame } from "../providers/FrameProvider";
import { DeleteProfile } from "./Delete";
import { ToggleAutoCast } from "./ToggleAutoCast";

export const ProfileSettings: FC<{ user: UserWithoutSigner; flashCount: number; cities: number }> = ({ user, flashCount, cities }) => {
  const { context } = useFrame();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex flex-col items-center gap-2">
        <Image src={context?.user.pfpUrl ?? `/splash.png`} width={64} height={64} alt="Profile" />
        <div className="flex gap-2 items-center">
          <p className="text-white font-invader text-[32px] tracking-widest my-[-10px]">{context?.user.displayName}</p>
          <FiSettings className="text-white hover:cursor-pointer" onClick={() => setIsSettingsOpen(!isSettingsOpen)} />
        </div>
        <p className="text-white font-invader text-[24px] tracking-widest my-[-10px]">
          {flashCount} {flashCount === 1 ? "Flash" : "Flashes"}
        </p>
        <p className="text-white font-invader text-[24px] tracking-widest my-[-10px]">
          {cities} {cities === 1 ? "City" : "Cities"}
        </p>
      </div>
      {isSettingsOpen && (
        <>
          <ToggleAutoCast auto_cast={user.auto_cast} />
          <DeleteProfile />
        </>
      )}
    </div>
  );
};
