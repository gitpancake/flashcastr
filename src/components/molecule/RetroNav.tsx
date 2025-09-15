"use client";

import { FEATURES } from "~/lib/constants";

export type NavTab = 'feed' | 'global' | 'leaderboard' | 'achievements' | 'favorites' | 'map' | 'wishlist';

interface RetroNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  showAchievements?: boolean;
  className?: string;
  currentUserFid?: number;
}

export function RetroNav({ activeTab, onTabChange, showAchievements = true, className = "", currentUserFid }: RetroNavProps) {

  const baseTabs = [
    { id: 'feed' as NavTab, label: 'FEED', icon: '>', key: 'F' },
    { id: 'global' as NavTab, label: 'GLOBAL', icon: '*', key: 'G' },
    { id: 'favorites' as NavTab, label: 'SAVED', icon: '★', key: 'S' },
    { id: 'wishlist' as NavTab, label: 'HUNT', icon: '🎯', key: 'H' },
    { id: 'leaderboard' as NavTab, label: 'BOARD', icon: '#', key: 'L' },
  ];

  // Add map tab only for admin user (configured via ADMIN_FID env variable)
  const showMapTab = currentUserFid && currentUserFid === FEATURES.ADMIN_FID;
  const tabsWithMap = showMapTab 
    ? [...baseTabs, { id: 'map' as NavTab, label: 'MAP', icon: '◉', key: 'M' }]
    : baseTabs;

  const tabs = showAchievements 
    ? [...tabsWithMap, { id: 'achievements' as NavTab, label: 'ACHIEVE', icon: '+', key: 'A' }]
    : tabsWithMap;

  return (
    <div className={`w-full bg-black border-b-2 border-green-400 ${className}`}>
      {/* ASCII Logo Header - Clean Style */}
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
        <div className="text-gray-400 text-xs">SPACE INVADER FLASH BROADCASTING SYSTEM v2.0</div>
      </div>

      {/* Navigation Tabs - Mobile Optimized */}
      <div className="flex justify-center p-2">
        <div className="flex w-full max-w-2xl bg-gray-900 border border-gray-700 font-mono">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
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
                <div className="font-bold hidden sm:block">
                  [{tab.key}] {tab.label}
                </div>
                <div className="font-bold sm:hidden text-[10px]">
                  {tab.label}
                </div>
              </div>

              {/* Active indicator */}
              {activeTab === tab.id && (
                <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-green-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Command Line Hint - Hide on mobile */}
      <div className="hidden sm:block text-center pb-2 text-xs text-gray-500 font-mono">
        USE KEYBOARD SHORTCUTS OR CLICK TO NAVIGATE • ESC TO RETURN
      </div>
    </div>
  );
}