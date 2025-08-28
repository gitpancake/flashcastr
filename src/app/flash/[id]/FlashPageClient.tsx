"use client";

import { useRouter } from "next/navigation";
import sdk from "@farcaster/frame-sdk";
import { GlobalFlash } from "~/lib/api.invaders.fun/flashes";

interface FlashPageClientProps {
  flash: GlobalFlash;
  timeAgo: string;
}

export default function FlashPageClient({ flash, timeAgo }: FlashPageClientProps) {
  const router = useRouter();

  const handleViewOnFarcaster = async () => {
    // Note: GlobalFlash doesn't have cast_hash, so we'll disable this for now
    // This button will be hidden if no cast data is available
    console.log('View on Farcaster not available for global flashes');
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
            src={`https://invader-flashes.s3.amazonaws.com${flash.img}`}
            alt={`Flash ${flash.flash_id}`}
            className="w-full h-full object-cover"
            // eslint-disable-next-line @next/next/no-img-element
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