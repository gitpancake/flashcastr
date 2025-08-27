"use client";

import { useRouter } from "next/navigation";
import sdk from "@farcaster/frame-sdk";
import { FlashResponse } from "~/lib/api.flashcastr.app/flashes";

interface FlashPageClientProps {
  flash: FlashResponse;
  timeAgo: string;
}

export default function FlashPageClient({ flash, timeAgo }: FlashPageClientProps) {
  const router = useRouter();

  const handleViewOnFarcaster = async () => {
    if (flash.cast_hash && flash.user_username) {
      await sdk.actions.openUrl(`https://warpcast.com/${flash.user_username}/${flash.cast_hash}`);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 font-mono bg-black min-h-screen">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="p-2 border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-all duration-200 font-bold text-xs"
        >
          [←] BACK
        </button>
      </div>

      {/* Flash Card - Blown Up Version */}
      <div className="bg-black border-2 border-green-400 overflow-hidden relative">
        {/* Flash Image */}
        <div className="aspect-square overflow-hidden">
          <img
            src={`https://invader-flashes.s3.amazonaws.com${flash.flash.img}`}
            alt={`Flash ${flash.flash.flash_id}`}
            className="w-full h-full object-cover"
            // eslint-disable-next-line @next/next/no-img-element
          />
        </div>

        {/* Flash Info */}
        <div className="p-4 space-y-3 bg-gray-900">
          <div className="text-green-400 text-lg font-bold">
            #{flash.flash.flash_id}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="text-gray-400 text-sm">PLAYER:</div>
              {flash.user_pfp_url && (
                <img
                  src={flash.user_pfp_url}
                  alt={flash.user_username || flash.flash.player}
                  className="w-4 h-4 rounded-full"
                  // eslint-disable-next-line @next/next/no-img-element
                />
              )}
              <div className="text-white text-sm">
                @ {flash.user_username || flash.flash.player}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-gray-400 text-sm">CITY:</div>
              <div className="text-white text-sm">
                {">"} {flash.flash.city}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-gray-400 text-sm">TIME:</div>
              <div className="text-gray-500 text-sm">{timeAgo}</div>
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 border-2 border-green-400/20 animate-pulse pointer-events-none" />
      </div>

      {/* View on Farcaster Button */}
      {flash.cast_hash && (
        <div className="mt-4 text-center">
          <button
            onClick={handleViewOnFarcaster}
            className="p-3 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-200 font-bold text-sm"
          >
            [F] VIEW ON FARCASTER
          </button>
        </div>
      )}
    </div>
  );
}