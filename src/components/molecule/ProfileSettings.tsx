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
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-6 font-mono">
      {/* ASCII Header - Mobile Responsive */}
      <div className="text-center mb-4 sm:mb-8">
        <pre className="text-green-400 text-[6px] sm:text-xs leading-none hidden sm:block">
          {`
██████╗ ██████╗  ██████╗ ███████╗██╗██╗     ███████╗
██╔══██╗██╔══██╗██╔═══██╗██╔════╝██║██║     ██╔════╝
██████╔╝██████╔╝██║   ██║█████╗  ██║██║     █████╗  
██╔═══╝ ██╔══██╗██║   ██║██╔══╝  ██║██║     ██╔══╝  
██║     ██║  ██║╚██████╔╝██║     ██║███████╗███████╗
╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝╚══════╝
`}
        </pre>
        <div className="text-green-400 text-lg sm:hidden font-mono font-bold">PROFILE</div>
        <div className="text-gray-400 text-[10px] sm:text-sm mt-2">SPACE INVADER FLASH COMMANDER</div>
      </div>

      {/* Profile Info Card */}
      <div className="bg-gray-900 border border-green-400 p-3 sm:p-4 mb-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          {/* Avatar */}
          <div className="relative">
            <Image 
              src={pfpUrl} 
              width={64} 
              height={64} 
              alt="Profile" 
              className="rounded-full border-2 border-gray-600" 
            />
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <h1 className="text-green-400 text-lg sm:text-xl font-bold">@{displayName}</h1>
              {user && (
                <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="text-cyan-400 hover:text-white transition-colors"
                >
                  <FiSettings size={18} />
                </button>
              )}
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="text-center">
                <span className="text-white font-bold text-sm sm:text-lg block">
                  {flashCount || 0}
                </span>
                <div className="text-gray-400">FLASHES</div>
              </div>
              <div className="text-center">
                <span className="text-cyan-400 font-bold text-sm sm:text-lg block">
                  {cities || 0}
                </span>
                <div className="text-gray-400">CITIES</div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {isSettingsOpen && user && (
          <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
            <div className="text-xs text-gray-400 mb-2">SETTINGS</div>
            <ToggleAutoCast auto_cast={user.auto_cast} />
            <DeleteProfile />
          </div>
        )}
      </div>
    </div>
  );
};
