"use client";

import { useState } from "react";
import { Badge } from "./Badge";
import { 
  getBadgeForFlashCount, 
  getNextBadge, 
  getCityAchievements, 
  ALL_BADGES,
  formatFlashCount,
  type UserProgress
} from "~/lib/badges";

interface AchievementsProps {
  userProgress: UserProgress;
  flashesPerCity?: Record<string, number>;
}

export function Achievements({ userProgress, flashesPerCity = {} }: AchievementsProps) {
  const [activeTab, setActiveTab] = useState<'badges' | 'achievements'>('badges');
  
  const currentBadge = getBadgeForFlashCount(userProgress.totalFlashes);
  const nextBadge = getNextBadge(userProgress.totalFlashes);
  const earnedAchievements = getCityAchievements(userProgress.citiesVisited, flashesPerCity);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header with stats */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          👾 Your Progress
        </h2>
        <div className="flex justify-center gap-8 text-sm text-gray-300">
          <div>
            <span className="text-purple-400 font-bold text-lg">
              {formatFlashCount(userProgress.totalFlashes)}
            </span>
            <div>Total Flashes</div>
          </div>
          <div>
            <span className="text-blue-400 font-bold text-lg">
              {userProgress.citiesVisited.length}
            </span>
            <div>Cities Visited</div>
          </div>
          <div>
            <span className="text-green-400 font-bold text-lg">
              {(userProgress.badges.length || 0) + earnedAchievements.length}
            </span>
            <div>Achievements</div>
          </div>
        </div>
      </div>

      {/* Current Badge Display */}
      {currentBadge && (
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-2">Current Rank</div>
            <Badge badge={currentBadge} earned={true} className="w-32" />
          </div>
          {nextBadge && (
            <>
              <div className="flex items-center mx-4">
                <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-transparent" />
                <span className="text-gray-400 mx-2">→</span>
                <div className="w-8 h-0.5 bg-gradient-to-l from-purple-500 to-transparent" />
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-2">Next Goal</div>
                <Badge 
                  badge={nextBadge} 
                  earned={false} 
                  currentCount={userProgress.totalFlashes}
                  className="w-32" 
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-800 rounded-lg p-1 flex">
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === 'badges'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Badges ({ALL_BADGES.length})
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === 'achievements'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Achievements ({earnedAchievements.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ALL_BADGES.map((badge) => {
            const earned = userProgress.totalFlashes >= badge.threshold;
            return (
              <Badge
                key={badge.id}
                badge={badge}
                earned={earned}
                currentCount={userProgress.totalFlashes}
                username={userProgress.username}
                allowSharing={earned}
              />
            );
          })}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {earnedAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedAchievements.map((achievement) => (
                <Badge
                  key={achievement.id}
                  achievement={achievement}
                  earned={true}
                  username={userProgress.username}
                  allowSharing={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Achievements Yet
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Start exploring different cities and sharing flashes to earn your first achievements!
              </p>
            </div>
          )}
          
          {/* Locked achievements preview */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-300 mb-4 text-center">
              🔒 Locked Achievements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
              {/* City Explorer */}
              {!earnedAchievements.some(a => a.id === 'city_explorer') && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">🏙️</div>
                  <div className="text-sm font-bold text-white mb-1">City Explorer</div>
                  <div className="text-xs text-gray-400">20 flashes in the same city</div>
                  <div className="text-xs text-purple-400 mt-2">
                    Best: {Math.max(...Object.values(flashesPerCity), 0)}/20
                  </div>
                </div>
              )}
              
              {/* Globe Trotter */}
              {!earnedAchievements.some(a => a.id === 'globe_trotter') && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">🌍</div>
                  <div className="text-sm font-bold text-white mb-1">Globe Trotter</div>
                  <div className="text-xs text-gray-400">Flash in 10 different cities</div>
                  <div className="text-xs text-purple-400 mt-2">
                    Progress: {userProgress.citiesVisited.length}/10
                  </div>
                </div>
              )}
              
              {/* World Invader */}
              {!earnedAchievements.some(a => a.id === 'world_invader') && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">🌐</div>
                  <div className="text-sm font-bold text-white mb-1">World Invader</div>
                  <div className="text-xs text-gray-400">Flash in 25 different cities</div>
                  <div className="text-xs text-purple-400 mt-2">
                    Progress: {userProgress.citiesVisited.length}/25
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}