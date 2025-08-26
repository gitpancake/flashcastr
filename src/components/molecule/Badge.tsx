"use client";

import { useState } from "react";
import { Badge as BadgeType, Achievement, calculateProgress } from "~/lib/badges";
import { ShareAchievement } from "./ShareAchievement";

interface BadgeProps {
  badge?: BadgeType;
  achievement?: Achievement;
  earned?: boolean;
  currentCount?: number;
  className?: string;
  username?: string;
  allowSharing?: boolean;
}

export function Badge({ 
  badge, 
  achievement, 
  earned = true, 
  currentCount, 
  className = "",
  username = "invader",
  allowSharing = false
}: BadgeProps) {
  const item = badge || achievement;
  const [showShareModal, setShowShareModal] = useState(false);
  
  if (!item) return null;

  const progress = badge && currentCount !== undefined 
    ? calculateProgress(currentCount, badge.threshold)
    : 100;

  const isLocked = !earned && badge;

  return (
    <>
      <div className={`relative group ${className}`}>
        <div
          className={`
            relative overflow-hidden rounded-xl p-4 border transition-all duration-300 cursor-pointer
            ${earned 
              ? `bg-gradient-to-br ${item.gradient} border-white/20 shadow-lg hover:shadow-xl hover:scale-105` 
              : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
            }
            ${isLocked ? 'filter grayscale opacity-60' : ''}
          `}
          onClick={() => earned && allowSharing && setShowShareModal(true)}
        >
        {/* Icon */}
        <div className="text-3xl mb-2 text-center">
          {isLocked ? '🔒' : item.icon}
        </div>

        {/* Name */}
        <div className="text-sm font-bold text-white mb-1 text-center">
          {item.name}
        </div>

        {/* Description */}
        <div className="text-xs text-gray-200 text-center">
          {item.description}
        </div>

        {/* Progress bar for locked badges */}
        {badge && !earned && currentCount !== undefined && (
          <div className="mt-3">
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 text-center mt-1">
              {currentCount}/{badge.threshold}
            </div>
          </div>
        )}

        {/* Tier indicator */}
        {badge && earned && (
          <div className="absolute top-1 right-1">
            <div className={`
              text-xs px-1.5 py-0.5 rounded-full font-bold
              ${badge.tier === 'bronze' ? 'bg-amber-600 text-amber-100' : ''}
              ${badge.tier === 'silver' ? 'bg-gray-500 text-gray-100' : ''}
              ${badge.tier === 'gold' ? 'bg-yellow-500 text-yellow-100' : ''}
              ${badge.tier === 'platinum' ? 'bg-purple-500 text-purple-100' : ''}
              ${badge.tier === 'diamond' ? 'bg-blue-500 text-blue-100' : ''}
            `}>
              {badge.tier.toUpperCase()}
            </div>
          </div>
        )}

        {/* Share button for earned items */}
        {earned && allowSharing && (
          <div className="absolute top-1 left-1">
            <div className="text-xs bg-black/80 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              SHARE
            </div>
          </div>
        )}

        {/* Glow effect for earned items */}
        {earned && (
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br ${item.gradient} rounded-xl blur-xl -z-10`} />
        )}
        </div>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 max-w-48 text-center border border-gray-700">
          <div className="font-semibold">{item.name}</div>
          <div className="text-gray-300">{item.description}</div>
          {badge && !earned && currentCount !== undefined && (
            <div className="text-purple-400 mt-1">
              Progress: {currentCount}/{badge.threshold}
            </div>
          )}
        </div>
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 mx-auto" />
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareAchievement
          badge={badge}
          achievement={achievement}
          username={username}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
}