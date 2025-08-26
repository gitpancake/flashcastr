"use client";

import Link from "next/link";
import { useState } from "react";
import Feed from "~/components/molecule/Feed";
import { type NavTab } from "~/components/molecule/RetroNav";
import { GlobalFlashes } from "~/components/molecule/GlobalFlashes";
import { Leaderboard } from "~/components/molecule/Leaderboard";
import { Achievements } from "~/components/molecule/Achievements";
import { useFrame } from "~/components/providers/FrameProvider";
import { useGetUser } from "~/hooks/api.flashcastrs.app/useGetUser";
import { useGetLeaderboard } from "~/hooks/api.flashcastrs.app/useGetLeaderboard";
import { useGetFlashStats } from "~/hooks/api.flashcastrs.app/useGetFlashStats";
import { FlashResponse } from "~/lib/api.flashcastr.app/flashes";
import { UserProgress } from "~/lib/badges";
import Setup from "./Setup";

const SETUP_SKIPPED_STORAGE_KEY = "flashcastr_setup_skipped";

interface AppInitializerProps {
  initialFlashes: FlashResponse[];
}

export default function AppInitializer({ initialFlashes }: AppInitializerProps) {
  const { context } = useFrame();
  const farcasterFid = context?.user?.fid;

  const { data: appUserArray, refetch: refetchAppUser } = useGetUser(farcasterFid);
  const appUser = appUserArray && appUserArray.length > 0 ? appUserArray[0] : undefined;
  
  const { data: leaderboardUsers = [] } = useGetLeaderboard();
  const { data: flashStats } = useGetFlashStats(farcasterFid);

  const [activeTab, setActiveTab] = useState<NavTab>('feed');
  const [showSetupFlow, setShowSetupFlow] = useState<boolean>(false);

  const handleSetupComplete = () => {
    refetchAppUser();
    setShowSetupFlow(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem(SETUP_SKIPPED_STORAGE_KEY);
    }
  };

  const handleSkipSetup = () => {
    setShowSetupFlow(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(SETUP_SKIPPED_STORAGE_KEY, "true");
    }
  };

  if (showSetupFlow) {
    return <Setup onSetupComplete={handleSetupComplete} onSkip={handleSkipSetup} />;
  }

  // Get real user stats for the current user
  const userProgress: UserProgress = {
    fid: farcasterFid || 0,
    username: context?.user?.username || 'anonymous',
    totalFlashes: flashStats?.flashCount || 0,
    citiesVisited: flashStats?.cities || [],
    badges: [],
    achievements: [],
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return <Feed initialFlashes={initialFlashes} />;
      case 'global':
        return <GlobalFlashes />;
      case 'leaderboard':
        return <Leaderboard users={leaderboardUsers} currentUserFid={farcasterFid} />;
      case 'achievements':
        return <Achievements userProgress={userProgress} />;
      default:
        return <Feed initialFlashes={initialFlashes} />;
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-black">
      
      {!appUser && (
        <div className="bg-gray-900 border-b border-green-400 p-3 text-center text-green-400 text-sm font-mono">
          <p>
            {">>> CONNECT FLASH INVADERS ACCOUNT <<<"}{" "}
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowSetupFlow(true);
                if (typeof window !== "undefined") localStorage.removeItem(SETUP_SKIPPED_STORAGE_KEY);
              }}
              className="font-bold underline hover:text-white animate-pulse"
            >
              [LINK ACCOUNT]
            </Link>{" "}
            FOR AUTO-CAST & FULL STATS
          </p>
        </div>
      )}
      
      <div className="flex-1">
        {renderTabContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="flex justify-center bg-black border-t border-green-400 p-2">
        <div className="flex w-full max-w-2xl bg-gray-900 border border-gray-700 font-mono">
          {[
            { id: 'feed' as NavTab, label: 'FEED', icon: '>', key: 'F' },
            { id: 'global' as NavTab, label: 'GLOBAL', icon: '*', key: 'G' },
            { id: 'leaderboard' as NavTab, label: 'BOARD', icon: '#', key: 'L' },
            { id: 'achievements' as NavTab, label: 'ACHIEVE', icon: '+', key: 'A' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex-1 px-2 py-2 sm:py-3 text-xs sm:text-sm border-r border-gray-700 last:border-r-0 
                transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-green-400 text-black' 
                  : 'text-green-400 hover:bg-gray-800'
                }
              `}
            >
              <div className="flex flex-col items-center gap-0.5">
                <div className="text-base sm:text-lg">{tab.icon}</div>
                <div className="font-bold text-[10px]">
                  {tab.label}
                </div>
              </div>

              {/* Active indicator */}
              {activeTab === tab.id && (
                <div className="absolute -top-0.5 left-0 right-0 h-0.5 bg-green-400" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
