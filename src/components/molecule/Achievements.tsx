"use client";

import { Badge } from "./Badge";
import { 
  getNextBadge,
  getNextCityBadge,
  ALL_BADGES,
  FLASH_COUNT_BADGES,
  CITY_COUNT_BADGES,
  formatFlashCount,
  type UserProgress
} from "~/lib/badges";

interface AchievementsProps {
  userProgress: UserProgress;
  flashesPerCity?: Record<string, number>;
}

export function Achievements({ userProgress }: AchievementsProps) {
  const nextFlashBadge = getNextBadge(userProgress.totalFlashes || 0);
  const nextCityBadge = getNextCityBadge(userProgress.citiesVisited?.length || 0);

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-6 font-mono">
      {/* Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-3 gap-2 sm:gap-8 text-xs sm:text-sm text-gray-300 mb-4 sm:mb-6">
        <div className="text-center">
          <span className="text-purple-400 font-bold text-sm sm:text-lg block">
            {formatFlashCount(userProgress.totalFlashes)}
          </span>
          <div className="text-[10px] sm:text-sm">TOTAL FLASHES</div>
        </div>
        <div className="text-center">
          <span className="text-blue-400 font-bold text-sm sm:text-lg block">
            {userProgress.citiesVisited?.length || 0}
          </span>
          <div className="text-[10px] sm:text-sm">CITIES VISITED</div>
        </div>
        <div className="text-center">
          <span className="text-green-400 font-bold text-sm sm:text-lg block">
            {ALL_BADGES.filter(badge => 
              (FLASH_COUNT_BADGES.includes(badge) && (userProgress.totalFlashes || 0) >= badge.threshold) ||
              (CITY_COUNT_BADGES.includes(badge) && (userProgress.citiesVisited?.length || 0) >= badge.threshold)
            ).length}
          </span>
          <div className="text-[10px] sm:text-sm">BADGES</div>
        </div>
      </div>

      {/* Progress Toward Next Goals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Next Flash Badge */}
        {nextFlashBadge && (
          <div className="bg-gray-900 border border-green-400 p-3 rounded">
            <div className="text-xs text-gray-400 mb-2 text-center">NEXT FLASH GOAL</div>
            <Badge 
              badge={nextFlashBadge} 
              earned={false} 
              currentCount={userProgress.totalFlashes || 0}
              className="w-full text-xs" 
            />
          </div>
        )}
        
        {/* Next City Badge */}
        {nextCityBadge && (
          <div className="bg-gray-900 border border-green-400 p-3 rounded">
            <div className="text-xs text-gray-400 mb-2 text-center">NEXT CITY GOAL</div>
            <Badge 
              badge={nextCityBadge} 
              earned={false} 
              currentCount={userProgress.citiesVisited?.length || 0}
              className="w-full text-xs" 
            />
          </div>
        )}
      </div>

      {/* All Badges Grid */}
      <div className="space-y-6">
        {/* Flash Badges */}
        <div>
          <h3 className="text-sm font-bold text-green-400 mb-3 text-center border-b border-green-400 pb-2">
            FLASH BADGES
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {FLASH_COUNT_BADGES.map((badge) => {
              const earned = (userProgress.totalFlashes || 0) >= badge.threshold;
              return (
                <Badge
                  key={badge.id}
                  badge={badge}
                  earned={earned}
                  currentCount={userProgress.totalFlashes || 0}
                  username={userProgress.username}
                  allowSharing={earned}
                  className="text-xs"
                />
              );
            })}
          </div>
        </div>

        {/* City Badges */}
        <div>
          <h3 className="text-sm font-bold text-green-400 mb-3 text-center border-b border-green-400 pb-2">
            CITY BADGES
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {CITY_COUNT_BADGES.map((badge) => {
              const earned = (userProgress.citiesVisited?.length || 0) >= badge.threshold;
              return (
                <Badge
                  key={badge.id}
                  badge={badge}
                  earned={earned}
                  currentCount={userProgress.citiesVisited?.length || 0}
                  username={userProgress.username}
                  allowSharing={earned}
                  className="text-xs"
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}