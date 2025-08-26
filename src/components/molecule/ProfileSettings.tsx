"use client";

import Image from "next/image";
import { FC, useState } from "react";
import { FiSettings } from "react-icons/fi";
import { User } from "~/lib/api.flashcastr.app/users";
import { DeleteProfile } from "./Delete";
import { ToggleAutoCast } from "./ToggleAutoCast";

// Minimal local type for Farcaster user data from frame context
interface FarcasterFrameUser {
  fid?: number;
  displayName?: string;
  pfpUrl?: string;
  // Add other fields if used from farcasterUserContext
}

interface ProfileSettingsProps {
  user?: User;
  farcasterUserContext?: FarcasterFrameUser | null; // Use local minimal type
  flashCount?: number;
  cities?: number;
}

export const ProfileSettings: FC<ProfileSettingsProps> = ({ user, farcasterUserContext, flashCount, cities }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const displayName = farcasterUserContext?.displayName || user?.username || "User";
  // Ensure pfpUrl access is safe if farcasterUserContext itself could be null/undefined
  const pfpUrl = farcasterUserContext?.pfpUrl ?? "/splash.png";

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex flex-col items-center gap-2">
        <Image src={pfpUrl} width={64} height={64} alt="Profile" className="rounded-full" />
        <div className="flex gap-2 items-center">
          <p className="text-white font-invader text-[32px] tracking-widest my-[-10px]">{displayName}</p>
          {user && <FiSettings size={20} className="text-white hover:cursor-pointer" onClick={() => setIsSettingsOpen(!isSettingsOpen)} />}
        </div>
        {flashCount !== undefined && flashCount !== null && (
          <p className="text-white font-invader text-[24px] tracking-widest my-[-10px]">
            {flashCount} {flashCount === 1 ? "Flash" : "Flashes"}
          </p>
        )}
        {cities !== undefined && cities !== null && (
          <p className="text-white font-invader text-[24px] tracking-widest my-[-10px]">
            {cities} {cities === 1 ? "City" : "Cities"}
          </p>
        )}
      </div>
      {isSettingsOpen && user && (
        <>
          <ToggleAutoCast auto_cast={user.auto_cast} />
          <DeleteProfile />
        </>
      )}
    </div>
  );
};
