"use client";

import { useState } from "react";
import sdk from "@farcaster/frame-sdk";
import { Badge as BadgeType, Achievement } from "~/lib/badges";

interface ShareAchievementProps {
  badge?: BadgeType;
  achievement?: Achievement;
  username: string;
  onClose: () => void;
}

export function ShareAchievement({ badge, achievement, username, onClose }: ShareAchievementProps) {
  const [isSharing, setIsSharing] = useState(false);
  
  const item = badge || achievement;
  if (!item) return null;

  const shareText = badge 
    ? `* Just earned the "${badge.name}" badge on @flashcastr! *\n\n${badge.description}\n\nJoin me in broadcasting Space Invader flashes across the galaxy!\n\nhttps://flashcastr.app`
    : `+ Achievement unlocked: "${achievement?.name}" on @flashcastr! +\n\n${achievement?.description}\n\nCome invade cities with me!\n\nhttps://flashcastr.app`;

  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      // Use Farcaster Mini App SDK to compose cast directly
      await sdk.actions.composeCast({
        text: shareText,
        embeds: ["https://flashcastr.app"]
      });
    } catch (error) {
      console.error('Error sharing achievement:', error);
    } finally {
      setIsSharing(false);
      onClose(); // Close modal after sharing attempt
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm font-mono p-2">
      <div className="bg-black border-2 border-green-400 p-3 sm:p-4 max-w-sm w-full relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-1 right-2 text-green-400 hover:text-white text-lg z-10"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-3">
          <pre className="text-green-400 text-[8px] sm:text-[10px] leading-none mb-1">
{`
███████╗██╗  ██╗ █████╗ ██████╗ ███████╗
██╔════╝██║  ██║██╔══██╗██╔══██╗██╔════╝
███████╗███████║███████║██████╔╝█████╗  
╚════██║██╔══██║██╔══██║██╔══██╗██╔══╝  
███████║██║  ██║██║  ██║██║  ██║███████╗
╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
`}
          </pre>
          <div className="text-gray-400 text-[10px]">SHARE YOUR ACHIEVEMENT</div>
        </div>

        {/* Achievement Display */}
        <div className="text-center mb-3">
          <div className="text-2xl sm:text-3xl mb-1">{item.icon}</div>
          <div className="text-green-400 text-sm sm:text-base font-bold mb-1">
            {item.name}
          </div>
          <div className="text-gray-300 text-xs mb-2">
            {badge ? `${item.description}` : item.description}
          </div>
          <div className="text-cyan-400 text-[10px]">
            EARNED BY: @{username}
          </div>
        </div>

        {/* Share Preview */}
        <div className="bg-gray-900 border border-gray-600 p-2 mb-3 text-[10px] max-h-24 overflow-y-auto">
          <div className="text-gray-400 mb-1">PREVIEW:</div>
          <div className="text-white whitespace-pre-wrap leading-tight">
            {shareText}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleShare}
            disabled={isSharing}
            className={`
              w-full p-2 border-2 transition-all duration-200 font-bold text-xs
              ${isSharing 
                ? 'border-gray-600 text-gray-600 cursor-not-allowed' 
                : 'border-green-400 text-green-400 hover:bg-green-400 hover:text-black'
              }
            `}
          >
            {isSharing ? 'CASTING...' : '[S] CAST ACHIEVEMENT'}
          </button>

          <button
            onClick={onClose}
            className="w-full p-2 border-2 border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white transition-all duration-200 font-bold text-xs"
          >
            [ESC] CANCEL
          </button>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 border-2 border-green-400/20 animate-pulse pointer-events-none" />
      </div>
    </div>
  );
}