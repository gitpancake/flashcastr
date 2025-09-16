"use client";

import { FrameContext } from "@farcaster/frame-core/dist/context";
import { useState } from "react";
import Image from "next/image";
import { FiSettings } from "react-icons/fi";
import { useGetFidFlashes } from "~/hooks/api.flashcastrs.app/useGetFidFlashes";
import { useGetFlashStats } from "~/hooks/api.flashcastrs.app/useGetFlashStats";
import { User } from "~/lib/api.flashcastr.app/users";
import { UserProgress } from "~/lib/badges";
import { Loading } from "../atom/Loading";
import Feed from "../molecule/Feed";
import { Achievements } from "../molecule/Achievements";
import { DeleteProfile } from "../molecule/Delete";
import { ToggleAutoCast } from "../molecule/ToggleAutoCast";

interface PersonalProfileProps {
  user?: User;
  farcasterUserContext?: FrameContext["user"];
}

export default function PersonalProfile({ user, farcasterUserContext }: PersonalProfileProps) {
  const [activeView, setActiveView] = useState<'feed' | 'achievements'>('feed');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const fidToUse = user?.fid || farcasterUserContext?.fid;

  const { data: stats, isLoading: statsLoading, error: statsError } = useGetFlashStats(fidToUse);
  const { data: flashes, isLoading: flashesLoading, error: flashesError } = useGetFidFlashes(fidToUse);

  if (statsLoading || flashesLoading) {
    return <Loading />;
  }

  // Handle API errors gracefully
  if (statsError || flashesError) {
    console.error("Profile API errors:", { statsError, flashesError });
  }

  if (!fidToUse) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-full bg-black text-white p-4">
        <p>User Farcaster ID not found.</p>
      </div>
    );
  }

  const displayName = farcasterUserContext?.displayName || user?.username || "User";
  const pfpUrl = farcasterUserContext?.pfpUrl ?? "/splash.png";

  // Get user progress for achievements
  const userProgress: UserProgress = {
    fid: fidToUse || 0,
    username: farcasterUserContext?.username || displayName,
    totalFlashes: stats?.flashCount || 0,
    citiesVisited: Array.isArray(stats?.cities) ? stats.cities : [],
    badges: [],
    achievements: [],
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-black font-mono">
      {/* FLASHCASTR Header */}
      <div className="w-full bg-black border-b-2 border-green-400">
        <div className="text-center py-4 border-b border-gray-700">
          <pre className="text-green-400 text-xs leading-none mb-2">
{`
███████╗██╗      █████╗ ███████╗██╗  ██╗
██╔════╝██║     ██╔══██╗██╔════╝██║  ██║
█████╗  ██║     ███████║███████╗███████║
██╔══╝  ██║     ██╔══██║╚════██║██╔══██║
██║     ███████╗██║  ██║███████║██║  ██║
╚═╝     ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
 ██████╗ █████╗ ███████╗████████╗██████╗ 
██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔══██╗
██║     ███████║███████╗   ██║   ██████╔╝
██║     ██╔══██║╚════██║   ██║   ██╔══██╗
╚██████╗██║  ██║███████║   ██║   ██║  ██║
 ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝
`}
          </pre>
          <div className="text-gray-400 text-xs">PERSONAL PROFILE & ACHIEVEMENT SYSTEM</div>
        </div>
      </div>

      {/* Profile Info Card */}
      <div className="w-full max-w-4xl mx-auto p-2 sm:p-6">
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
                    {stats?.flashCount || 0}
                  </span>
                  <div className="text-gray-400">FLASHES</div>
                </div>
                <div className="text-center">
                  <span className="text-cyan-400 font-bold text-sm sm:text-lg block">
                    {stats?.cities?.length || 0}
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

        {/* View Switcher */}
        <div className="bg-gray-900 border border-green-400 p-2 mb-4">
          <div className="flex justify-center">
            <div className="flex bg-black border border-gray-700">
              <button
                onClick={() => setActiveView('feed')}
                className={`
                  px-4 py-2 text-xs sm:text-sm border-r border-gray-700 transition-all duration-200
                  ${activeView === 'feed' 
                    ? 'bg-green-400 text-black' 
                    : 'text-green-400 hover:bg-gray-800'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="text-base">{'>'}</div>
                  <div className="font-bold">[F] FEED</div>
                </div>
              </button>
              <button
                onClick={() => setActiveView('achievements')}
                className={`
                  px-4 py-2 text-xs sm:text-sm transition-all duration-200
                  ${activeView === 'achievements' 
                    ? 'bg-green-400 text-black' 
                    : 'text-green-400 hover:bg-gray-800'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="text-base">+</div>
                  <div className="font-bold">[A] ACHIEVE</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {activeView === 'feed' && (
          <>
            {/* User Feed */}
            {flashes && Array.isArray(flashes) && flashes.length > 0 && fidToUse ? (
              <Feed initialFlashes={flashes} fid={fidToUse} showHeader={false} />
            ) : (
              <div className="w-full max-w-4xl mx-auto p-2 sm:p-6">
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg">NO FLASHES FOUND</div>
                  <div className="text-gray-500 text-sm mt-2">
                    {!user ? "Link your Flash Invaders account to see your flashes and enable auto-casting." : "No flashes available for this user."}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeView === 'achievements' && (
          <Achievements userProgress={userProgress} />
        )}
      </div>
    </div>
  );
}
