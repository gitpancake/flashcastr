"use client";

import { useState } from "react";

export type NavTab = 'feed' | 'global' | 'leaderboard' | 'achievements';

interface RetroNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  className?: string;
}

export function RetroNav({ activeTab, onTabChange, className = "" }: RetroNavProps) {
  const [hoverTab, setHoverTab] = useState<NavTab | null>(null);

  const tabs = [
    { id: 'feed' as NavTab, label: 'FEED', icon: '📡', key: 'F' },
    { id: 'global' as NavTab, label: 'GLOBAL', icon: '🌐', key: 'G' },
    { id: 'leaderboard' as NavTab, label: 'LEADERBOARD', icon: '🏆', key: 'L' },
    { id: 'achievements' as NavTab, label: 'ACHIEVEMENTS', icon: '🎖️', key: 'A' },
  ];

  return (
    <div className={`w-full bg-black border-b-2 border-green-400 ${className}`}>
      {/* ASCII Logo Header */}
      <div className="text-center py-4 border-b border-gray-700">
        <pre className="text-green-400 text-xs leading-none">
{`
███████╗██╗      █████╗ ███████╗██╗  ██╗ ██████╗ █████╗ ███████╗████████╗██████╗ 
██╔════╝██║     ██╔══██╗██╔════╝██║  ██║██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔══██╗
█████╗  ██║     ███████║███████╗███████║██║     ███████║███████╗   ██║   ██████╔╝
██╔══╝  ██║     ██╔══██║╚════██║██╔══██║██║     ██╔══██║╚════██║   ██║   ██╔══██╗
██║     ███████╗██║  ██║███████║██║  ██║╚██████╗██║  ██║███████║   ██║   ██║  ██║
╚═╝     ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝
`}
        </pre>
        <div className="text-gray-400 text-xs mt-1 font-mono">
          SPACE INVADER FLASH BROADCASTING SYSTEM v2.0
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-gray-900 border-2 border-gray-700 m-4 font-mono">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              onMouseEnter={() => setHoverTab(tab.id)}
              onMouseLeave={() => setHoverTab(null)}
              className={`
                relative px-4 py-3 text-sm border-r border-gray-700 last:border-r-0 
                transition-all duration-200 min-w-[120px]
                ${activeTab === tab.id 
                  ? 'bg-green-400 text-black' 
                  : 'text-green-400 hover:bg-gray-800'
                }
              `}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="text-lg">{tab.icon}</div>
                <div className="font-bold">
                  [{tab.key}] {tab.label}
                </div>
              </div>

              {/* Glow effect */}
              {(activeTab === tab.id || hoverTab === tab.id) && (
                <div className="absolute inset-0 bg-green-400/20 pointer-events-none animate-pulse" />
              )}

              {/* Active indicator */}
              {activeTab === tab.id && (
                <div className="absolute -bottom-0.5 left-0 right-0 h-1 bg-green-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Command Line Hint */}
      <div className="text-center pb-2 text-xs text-gray-500 font-mono">
        USE KEYBOARD SHORTCUTS OR CLICK TO NAVIGATE • ESC TO RETURN
      </div>
    </div>
  );
}