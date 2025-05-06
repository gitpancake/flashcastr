import sdk from "@farcaster/frame-sdk";
import Image from "next/image";
import Link from "next/link";
import { Ref } from "react";

interface FlashCardProps {
  player?: string;
  city: string;
  timeAgo: string;
  flashNumber: string;
  imageUrl: string;
  ref: Ref<HTMLDivElement>;
  avatar: string;
  fid: number;
  castHash: string | null;
}

export default function FlashCard({ avatar, player, fid, city, timeAgo, flashNumber, imageUrl, ref, castHash }: FlashCardProps) {
  return (
    <div className="bg-[#1E1E1E] p-2 flex items-center justify-between w-full max-w-xl max-h-[100px] animate-fade-in" ref={ref}>
      <div className="flex items-start gap-3">
        <Image width={1920} height={1080} src={avatar} alt="avatar" className="w-[30px] h-[30px] object-cover shadow-lg" />

        <div className="flex flex-col gap-3 h-full">
          <div className="flex flex-col gap-0">
            <Link href={`/profile/${fid}`} target="_self">
              <p className="font-invader text-white text-[28px] leading-none">{player}</p>
            </Link>
            <p className="font-invader text-gray-400 text-[18px] leading-none">{city}</p>
          </div>
          <p className="font-invader text-gray-300 text-[12px] leading-none">{`${timeAgo} | #${flashNumber}`}</p>
        </div>
      </div>

      <Image
        onClick={() => {
          if (castHash) {
            sdk.actions.openUrl(`https://warpcast.com/${player}/${castHash}`);
          } else {
            sdk.actions.openUrl("https://invader-flashes.s3.amazonaws.com" + imageUrl);
          }
        }}
        width={1920}
        height={1080}
        src={"https://invader-flashes.s3.amazonaws.com" + imageUrl}
        alt="flash"
        className="w-[60px] h-[60px] object-cover border border-gray-800 hover:cursor-pointer"
      />
    </div>
  );
}
