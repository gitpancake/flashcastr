"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GlobalFlash } from "~/lib/api.invaders.fun/flashes";
import { getImageUrl } from "~/lib/help/getImageUrl";
import { shareToFarcaster, shareToTwitter, copyToClipboard } from "~/lib/share";
import { useKeyboardShortcuts } from "~/hooks/useKeyboardShortcuts";

// Extended flash interface to handle Farcaster data
interface ExtendedFlash extends GlobalFlash {
  farcaster_username?: string;
  farcaster_pfp?: string;
  farcaster_fid?: number;
}

interface FlashPageClientProps {
  flash: ExtendedFlash;
  timeAgo: string;
}

export default function FlashPageClient({ flash, timeAgo }: FlashPageClientProps) {
  const router = useRouter();
  
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);


  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };


  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = async () => {
    const currentUrl = window.location.href;
    const success = await copyToClipboard({ flash, currentUrl });
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
    setShowShareMenu(false);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onBack: handleBack,
    onShare: handleShare,
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-4 font-mono bg-black min-h-screen">
      {/* Action Bar */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={handleBack}
          className="p-2 border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-all duration-200 font-bold text-xs"
        >
          [←] BACK
        </button>

        <div className="flex-1"></div>


        {/* Share Button */}
        <div className="relative">
          <button
            onClick={handleShare}
            className="p-2 border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black transition-all duration-200 font-bold text-xs"
          >
            [↗] SHARE
          </button>

          {/* Share Menu */}
          {showShareMenu && (
            <div className="absolute right-0 top-full mt-1 bg-gray-900 border-2 border-purple-400 z-50 min-w-[160px]">
              <button
                onClick={() => {
                  shareToFarcaster({ flash, currentUrl: window.location.href });
                  setShowShareMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-purple-400 hover:bg-gray-800 text-xs transition-colors duration-200"
              >
                [FC] FARCASTER
              </button>
              <button
                onClick={() => {
                  shareToTwitter({ flash, currentUrl: window.location.href });
                  setShowShareMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-purple-400 hover:bg-gray-800 text-xs transition-colors duration-200"
              >
                [TW] TWITTER
              </button>
              <button
                onClick={handleCopyLink}
                className="w-full text-left px-3 py-2 text-purple-400 hover:bg-gray-800 text-xs transition-colors duration-200"
              >
                [CP] COPY LINK
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Copy Success Message */}
      {copySuccess && (
        <div className="mb-4 p-2 bg-green-900 border border-green-400 text-green-400 text-xs">
          [OK] COPIED TO CLIPBOARD
        </div>
      )}

      {/* Flash Card - Blown Up Version */}
      <div className="bg-black border-2 border-green-400 overflow-hidden relative">
        {/* Flash Image */}
        <div className="aspect-square overflow-hidden relative">
          <Image
            src={getImageUrl(flash)}
            alt={`Flash ${flash.flash_id}`}
            fill
            className="object-cover"
          />
        </div>

        {/* Flash Info - Match Feed UI */}
        <div className="p-4 space-y-3 bg-gray-900">
          <div className="text-green-400 text-lg font-bold">
            #{flash.flash_id.toLocaleString()}
          </div>
          
          {/* Clickable User Info - Match Feed Design */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 p-2 -mx-2 rounded transition-colors duration-200"
            onClick={() => {
              const fid = flash.farcaster_fid || flash.player;
              router.push(`/profile/${fid}`);
            }}
          >
            {flash.farcaster_pfp && (
              <Image
                src={flash.farcaster_pfp}
                alt={flash.farcaster_username || flash.player}
                width={20}
                height={20}
                className="rounded-full"
              />
            )}
            <div className="text-white text-sm">
              @ {flash.farcaster_username || flash.player}
            </div>
          </div>
          
          <div className="text-gray-400 text-sm">
            {">"} {flash.city}
          </div>
          
          <div className="text-gray-500 text-sm">{timeAgo}</div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 border-2 border-green-400/20 animate-pulse pointer-events-none" />
      </div>

      {/* Note: View on Farcaster not available for global flashes as they don't have cast_hash */}
    </div>
  );
}