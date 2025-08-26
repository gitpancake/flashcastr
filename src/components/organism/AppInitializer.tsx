"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loading } from "~/components/atom/Loading";
import Feed from "~/components/molecule/Feed";
import { RetroNav, type NavTab } from "~/components/molecule/RetroNav";
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

  const { data: appUserArray, isLoading: userLoading, refetch: refetchAppUser } = useGetUser(farcasterFid);
  const appUser = appUserArray && appUserArray.length > 0 ? appUserArray[0] : undefined;
  
  const { data: leaderboardUsers = [] } = useGetLeaderboard();
  const { data: flashStats } = useGetFlashStats(farcasterFid);

  const [activeTab, setActiveTab] = useState<NavTab>('feed');
  const [showSetupFlow, setShowSetupFlow] = useState<boolean | null>(null);
  const [hasSkippedSetup, setHasSkippedSetup] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(SETUP_SKIPPED_STORAGE_KEY) === "true";
    }
    return false;
  });

  useEffect(() => {
    if (!farcasterFid) {
      // Wait for FID to be available
      setShowSetupFlow(null); // Remain in undecided/loading state
      return;
    }
    if (userLoading) {
      // Still loading user data
      return;
    }

    if (!appUser && !hasSkippedSetup) {
      setShowSetupFlow(true);
    } else {
      setShowSetupFlow(false);
    }
  }, [userLoading, appUser, hasSkippedSetup, farcasterFid]);

  const handleSetupComplete = () => {
    refetchAppUser();
    setShowSetupFlow(false);
    setHasSkippedSetup(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem(SETUP_SKIPPED_STORAGE_KEY);
    }
  };

  const handleSkipSetup = () => {
    setHasSkippedSetup(true);
    setShowSetupFlow(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(SETUP_SKIPPED_STORAGE_KEY, "true");
    }
  };

  if (showSetupFlow === null || (!farcasterFid && showSetupFlow === null) || (farcasterFid && userLoading && !appUser && !hasSkippedSetup && showSetupFlow === null)) {
    return <Loading />;
  }

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
      <RetroNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      {hasSkippedSetup && !appUser && activeTab === 'feed' && (
        <div className="bg-gray-900 border-b border-yellow-400 p-3 text-center text-yellow-400 text-sm font-mono">
          <p>
            {">>> WARNING: ACCOUNT NOT LINKED <<<"}{" "}
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setHasSkippedSetup(false);
                setShowSetupFlow(true);
                if (typeof window !== "undefined") localStorage.removeItem(SETUP_SKIPPED_STORAGE_KEY);
              }}
              className="font-bold underline hover:text-white blink"
            >
              [CONNECT FLASH INVADERS ACCOUNT]
            </Link>{" "}
            TO ENABLE AUTO-CAST & FULL STATS.
          </p>
        </div>
      )}
      
      <div className="flex-1">
        {renderTabContent()}
      </div>
    </div>
  );
}
