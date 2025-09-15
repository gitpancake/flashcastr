"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GlobalFlash } from "~/lib/api.invaders.fun/flashes";
import { getImageUrl } from "~/lib/help/getImageUrl";
import { shareToFarcaster, shareToTwitter, copyToClipboard } from "~/lib/share";
import { addToFavorites, removeFromFavorites, isFavorite } from "~/lib/favorites";
import { useFrame } from "~/components/providers/FrameProvider";
import { useKeyboardShortcuts } from "~/hooks/useKeyboardShortcuts";

interface FlashPageClientProps {
  flash: GlobalFlash;
  timeAgo: string;
}

export default function FlashPageClient({ flash, timeAgo }: FlashPageClientProps) {
  const router = useRouter();
  const { context } = useFrame();
  const farcasterFid = context?.user?.fid;
  
  const [isInFavorites, setIsInFavorites] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const isFav = await isFavorite(flash.flash_id, farcasterFid);
        setIsInFavorites(isFav);
        setFavoriteError(false);
      } catch (error) {
        console.error('Error checking favorite status:', error);
        setFavoriteError(true);
      }
    };
    
    checkFavoriteStatus();
  }, [flash.flash_id, farcasterFid]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleFavoriteToggle = async () => {
    if (favoriteLoading) return;
    
    setFavoriteLoading(true);
    try {
      const success = isInFavorites 
        ? await removeFromFavorites(flash.flash_id, farcasterFid)
        : await addToFavorites({
            flash_id: flash.flash_id,
            player: flash.player,
            city: flash.city,
            timestamp: flash.timestamp,
            img: flash.img,
            ipfs_cid: flash.ipfs_cid,
            text: flash.text,
          }, farcasterFid);

      if (success) {
        setIsInFavorites(!isInFavorites);
        setFavoriteError(false);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setFavoriteError(true);
    } finally {
      setFavoriteLoading(false);
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
    onFavorite: handleFavoriteToggle,
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

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteToggle}
          disabled={favoriteLoading || !farcasterFid || favoriteError}
          className={`p-2 border-2 transition-all duration-200 font-bold text-xs ${
            !farcasterFid
              ? 'border-gray-700 text-gray-600 cursor-not-allowed'
              : favoriteError
              ? 'border-red-400 text-red-400 cursor-not-allowed'
              : favoriteLoading
              ? 'border-gray-600 text-gray-500'
              : isInFavorites
              ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10'
              : 'border-gray-600 text-gray-400 hover:border-yellow-400 hover:text-yellow-400'
          }`}
          title={
            !farcasterFid 
              ? 'Sign in with Farcaster to save flashes' 
              : favoriteError
              ? 'System temporarily unavailable'
              : favoriteLoading
              ? 'Loading...'
              : isInFavorites 
              ? 'Remove from favorites' 
              : 'Add to favorites'
          }
        >
          {favoriteError
            ? '[!] ERROR'
            : favoriteLoading 
            ? '[...] LOADING'
            : isInFavorites 
            ? '[*] SAVED' 
            : '[+] SAVE'
          }
        </button>

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

        {/* Flash Info */}
        <div className="p-4 space-y-3 bg-gray-900">
          <div className="text-green-400 text-lg font-bold">
            #{flash.flash_id}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="text-gray-400 text-sm">PLAYER:</div>
              <div className="text-white text-sm">
                @ {flash.player}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-gray-400 text-sm">CITY:</div>
              <div className="text-white text-sm">
                {">"} {flash.city}
              </div>
            </div>
            
            {flash.text && (
              <div className="flex items-start gap-2">
                <div className="text-gray-400 text-sm">TEXT:</div>
                <div className="text-gray-300 text-sm leading-relaxed">
                  {flash.text}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className="text-gray-400 text-sm">TIME:</div>
              <div className="text-gray-500 text-sm">{timeAgo}</div>
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 border-2 border-green-400/20 animate-pulse pointer-events-none" />
      </div>

      {/* Note: View on Farcaster not available for global flashes as they don't have cast_hash */}
    </div>
  );
}