"use client";

import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import Feed from "~/components/molecule/Feed";
import { RetroNav, type NavTab } from "~/components/molecule/RetroNav";
import { GlobalFlashes } from "~/components/molecule/GlobalFlashes";
import { Leaderboard } from "~/components/molecule/Leaderboard";
import { Achievements } from "~/components/molecule/Achievements";
import { InvaderMap } from "~/components/molecule/InvaderMap";
import SearchBar from "~/components/molecule/SearchBar";
import { useFrame } from "~/components/providers/FrameProvider";
import { useKeyboardShortcuts } from "~/hooks/useKeyboardShortcuts";
import { useExperimentalAccess } from "~/hooks/useExperimentalAccess";
import { useGetUser } from "~/hooks/api.flashcastrs.app/useGetUser";
import { useGetLeaderboard } from "~/hooks/api.flashcastrs.app/useGetLeaderboard";
import { useGetFlashStats } from "~/hooks/api.flashcastrs.app/useGetFlashStats";
import { FlashResponse } from "~/lib/api.flashcastr.app/flashes";
import { User } from "~/lib/api.flashcastr.app/users";
import { UserProgress } from "~/lib/badges";
import Setup from "./Setup";

const SETUP_SKIPPED_STORAGE_KEY = "flashcastr_setup_skipped";

interface AppInitializerProps {
  initialFlashes: FlashResponse[];
}

export default function AppInitializer({ initialFlashes }: AppInitializerProps) {
  const { context } = useFrame();
  const farcasterFid = context?.user?.fid;
  const hasUserContext = !!(context?.user?.fid && context?.user?.username);

  const { data: appUserArray, refetch: refetchAppUser, isLoading: isLoadingUser } = useGetUser(farcasterFid);
  const appUser = appUserArray && appUserArray.length > 0 ? appUserArray[0] : undefined;
  
  const { data: leaderboardUsers = [] } = useGetLeaderboard();
  const { data: flashStats } = useGetFlashStats(farcasterFid);
  const { hasAccess: hasExperimentalAccess } = useExperimentalAccess(farcasterFid);

  const [activeTab, setActiveTab] = useState<NavTab>('feed');
  const [showSetupFlow, setShowSetupFlow] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Map navigation state for wishlist integration
  const [mapTargetLocation, setMapTargetLocation] = useState<{
    lat: number;
    lng: number;
    invaderId: string;
  } | null>(null);

  const handleTabChange = useCallback((tab: NavTab) => {
    // If achievements tab is selected but user doesn't have context, redirect to feed
    if (tab === 'achievements' && !hasUserContext) {
      setActiveTab('feed');
      return;
    }
    // If map tab is selected but user doesn't have experimental access, redirect to feed
    if (tab === 'map' && !hasExperimentalAccess) {
      setActiveTab('feed');
      return;
    }
    setActiveTab(tab);
  }, [hasUserContext, hasExperimentalAccess]);


  // If user is on achievements tab but loses context, redirect to feed
  // If user is on map tab but doesn't have experimental access, redirect to feed
  useEffect(() => {
    if (activeTab === 'achievements' && !hasUserContext) {
      setActiveTab('feed');
    }
    if (activeTab === 'map' && !hasExperimentalAccess) {
      setActiveTab('feed');
    }
  }, [activeTab, hasUserContext, hasExperimentalAccess]);

  // Add global keyboard shortcuts
  useKeyboardShortcuts({
    onHome: () => setActiveTab('feed'),
    onGlobal: () => setActiveTab('global'),
    onLeaderboard: () => setActiveTab('leaderboard'),
    onSearch: () => setShowSearch(true),
  });

  const handleSetupComplete = (_user: User) => { // eslint-disable-line @typescript-eslint/no-unused-vars
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

  // Get real user stats for the current user with safe defaults
  const userProgress: UserProgress = {
    fid: farcasterFid || 0,
    username: context?.user?.username || 'anonymous',
    totalFlashes: flashStats?.flashCount || 0,
    citiesVisited: Array.isArray(flashStats?.cities) ? flashStats.cities : [],
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
        return <Leaderboard users={leaderboardUsers} currentUsername={appUser?.username} />;
      case 'achievements':
        return <Achievements userProgress={userProgress} />;
      case 'map':
        return <InvaderMap targetLocation={mapTargetLocation} onLocationTargeted={() => setMapTargetLocation(null)} />;
      default:
        return <Feed initialFlashes={initialFlashes} />;
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-black">
      <RetroNav activeTab={activeTab} onTabChange={handleTabChange} showAchievements={hasUserContext} currentUserFid={farcasterFid} hasExperimentalAccess={hasExperimentalAccess} />
      
      {/* Only show the banner if:
          1. We have a farcasterFid (user is authenticated)
          2. User data has finished loading (not in loading state)
          3. No appUser found (account not linked)
      */}
      {farcasterFid && !isLoadingUser && !appUser && (
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

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center z-50 p-4 pt-20">
          <div className="w-full max-w-md">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onBlur={() => setShowSearch(false)}
              autoFocus={true}
            />
            <div className="mt-2 text-center text-xs text-gray-500 font-mono">
              TYPE TO SEARCH • ENTER TO GO • ESC TO CLOSE
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
