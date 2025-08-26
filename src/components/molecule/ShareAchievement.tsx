"use client";

import { useState } from "react";
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
    ? `🚀 Just earned the "${badge.name}" badge on @flashcastr! 👾\n\n${badge.description}\n\nJoin me in broadcasting Space Invader flashes across the galaxy! 🌌\n\nhttps://flashcastr.com`
    : `🎖️ Achievement unlocked: "${achievement?.name}" on @flashcastr! 👾\n\n${achievement?.description}\n\nCome invade cities with me! 🏙️👽\n\nhttps://flashcastr.com`;

  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      // Create a Farcaster cast with the achievement
      const castUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`;
      window.open(castUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error sharing achievement:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      // Could add a toast notification here
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm font-mono">
      <div className="bg-black border-2 border-green-400 p-6 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-green-400 hover:text-white text-xl"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <pre className="text-green-400 text-xs leading-none mb-2">
{`
███████╗██╗  ██╗ █████╗ ██████╗ ███████╗
██╔════╝██║  ██║██╔══██╗██╔══██╗██╔════╝
███████╗███████║███████║██████╔╝█████╗  
╚════██║██╔══██║██╔══██║██╔══██╗██╔══╝  
███████║██║  ██║██║  ██║██║  ██║███████╗
╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
`}
          </pre>
          <div className="text-gray-400 text-xs">SHARE YOUR ACHIEVEMENT</div>
        </div>

        {/* Achievement Display */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{item.icon}</div>
          <div className="text-green-400 text-lg font-bold mb-1">
            {item.name}
          </div>
          <div className="text-gray-300 text-sm mb-3">
            {item.description}
          </div>
          <div className="text-cyan-400 text-xs">
            EARNED BY: @{username}
          </div>
        </div>

        {/* Share Preview */}
        <div className="bg-gray-900 border border-gray-600 p-3 mb-4 text-xs">
          <div className="text-gray-400 mb-2">PREVIEW:</div>
          <div className="text-white whitespace-pre-wrap">
            {shareText}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleShare}
            disabled={isSharing}
            className={`
              w-full p-3 border-2 transition-all duration-200 font-bold text-sm
              ${isSharing 
                ? 'border-gray-600 text-gray-600 cursor-not-allowed' 
                : 'border-green-400 text-green-400 hover:bg-green-400 hover:text-black'
              }
            `}
          >
            {isSharing ? 'SHARING...' : '[S] SHARE ON FARCASTER'}
          </button>

          <button
            onClick={copyToClipboard}
            className="w-full p-3 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-200 font-bold text-sm"
          >
            [C] COPY TO CLIPBOARD
          </button>

          <button
            onClick={onClose}
            className="w-full p-3 border-2 border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white transition-all duration-200 font-bold text-sm"
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