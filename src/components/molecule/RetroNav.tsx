"use client";


export type NavTab = 'feed' | 'global' | 'leaderboard' | 'achievements' | 'map' | 'progress';

interface RetroNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  showAchievements?: boolean;
  showProgress?: boolean;
  className?: string;
  currentUserFid?: number;
  hasExperimentalAccess?: boolean;
}

export function RetroNav({ activeTab, onTabChange, showAchievements = true, showProgress = true, className = "", hasExperimentalAccess = false }: RetroNavProps) {

  const baseTabs = [
    { id: 'feed' as NavTab, label: 'FEED', icon: '>', key: 'F' },
    { id: 'global' as NavTab, label: 'GLOBAL', icon: '*', key: 'G' },
    { id: 'leaderboard' as NavTab, label: 'BOARD', icon: '#', key: 'L' },
  ];

  // Add progress tab for authenticated users
  const tabsWithProgress = showProgress
    ? [...baseTabs, { id: 'progress' as NavTab, label: 'PROGRESS', icon: '↑', key: 'P' }]
    : baseTabs;

  // Add map tab for experimental users (admin or experimental users)
  const tabsWithMap = hasExperimentalAccess
    ? [...tabsWithProgress, { id: 'map' as NavTab, label: 'MAP', icon: '◉', key: 'M' }]
    : tabsWithProgress;

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

      {/* Navigation Tabs - Horizontally Scrollable */}
      <div className="flex justify-center p-2 overflow-hidden">
        <div className="flex overflow-x-auto overflow-y-hidden scrollbar-hide w-full max-w-2xl bg-gray-900 border border-gray-700 font-mono scroll-smooth snap-x snap-mandatory">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm border-r border-gray-700 last:border-r-0
                transition-all duration-200 snap-start
                ${activeTab === tab.id
                  ? 'bg-green-400 text-black'
                  : 'text-green-400 hover:bg-gray-800'
                }
              `}
            >
              <div className="flex flex-col items-center gap-0.5 min-w-[60px] sm:min-w-[80px]">
                <div className="text-base sm:text-lg">{tab.icon}</div>
                <div className="font-bold hidden sm:block whitespace-nowrap">
                  [{tab.key}] {tab.label}
                </div>
                <div className="font-bold sm:hidden text-[10px] whitespace-nowrap">
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