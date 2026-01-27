import sdk from "@farcaster/frame-sdk";
import Image from "next/image";
import Link from "next/link";
import { Ref, useCallback } from "react";
import addCommasToNumber from "~/lib/help/addCommasToNumber";
import { getImageUrl } from "~/lib/help/getImageUrl";

interface FlashCardProps {
  player?: string;
  city: string;
  timeAgo: string;
  flashNumber: string;
  flash: {
    ipfs_cid?: string;
    img?: string; // Legacy field - can be removed when all data has ipfs_cid
  };
  ref: Ref<HTMLDivElement>;
  avatar: string;
  fid: number;
  castHash: string | null;
  isPlayer: boolean;
  linkedInvader?: string | null;
}

export default function FlashCard({ isPlayer, avatar, player, fid, city, timeAgo, flashNumber, flash, ref, castHash, linkedInvader }: FlashCardProps) {
  const imageUrl = getImageUrl(flash);
  
  const handleImageClick = useCallback(() => {
    if (castHash) {
      sdk.actions.openUrl(`https://warpcast.com/${player}/${castHash}`);
    } else {
      sdk.actions.openUrl(imageUrl);
    }
  }, [castHash, player, imageUrl]);

  const profileHref = isPlayer ? `/profile` : `/profile/${fid}`;
  const timestampText = `${timeAgo} | #${addCommasToNumber(flashNumber)}`;

  return (
    <div className="bg-[#1E1E1E] p-2 flex items-center justify-between w-full max-w-2xl max-h-[100px] animate-fade-in relative" ref={ref}>
      <div className="flex items-start gap-3">
        <Image 
          width={30} 
          height={30} 
          src={avatar} 
          alt={`${player} avatar`} 
          className="w-[30px] h-[30px] object-cover shadow-lg" 
        />

        <div className="flex flex-col gap-3 h-full">
          <div className="flex flex-col gap-0">
            <Link href={profileHref} target="_self">
              <p className="font-invader text-white text-[28px] leading-none">{player}</p>
            </Link>
            <p className="font-invader text-gray-400 text-[18px] leading-none">{city}</p>
          </div>
          <p className="font-invader text-gray-300 text-[12px] leading-none tracking-wider">{timestampText}</p>
        </div>
      </div>

      <div className="relative">
        {linkedInvader && (
          <div className="absolute -top-1 -right-1 bg-cyan-400 text-black text-[8px] px-1 py-0.5 font-bold z-10 border border-cyan-400">
            ↗ {linkedInvader}
          </div>
        )}
        <Image
          onClick={handleImageClick}
          width={60}
          height={60}
          src={imageUrl}
          alt={`Flash from ${city}`}
          className="w-[60px] h-[60px] object-cover border border-gray-800 hover:cursor-pointer"
        />
      </div>
    </div>
  );
}
