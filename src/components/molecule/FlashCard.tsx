import Image from "next/image";
import { Ref } from "react";

interface FlashCardProps {
  player?: string;
  city: string;
  timeAgo: string;
  flashNumber: string;
  imageUrl: string;
  ref: Ref<HTMLDivElement>;
  avatar: string;
}

export default function FlashCard({ avatar, player, city, timeAgo, flashNumber, imageUrl, ref }: FlashCardProps) {
  return (
    <div className="bg-[#1E1E1E] p-2 flex items-center justify-between w-full max-w-xl max-h-[100px] animate-fade-in" ref={ref}>
      <div className="flex items-start gap-3">
        <Image width={1920} height={1080} src={avatar} alt="avatar" className="w-[30px] h-[30px] object-cover shadow-lg" />

        <div className="flex flex-col gap-3 h-full">
          <div className="flex flex-col gap-0">
            <p className="font-invader text-white text-[28px] leading-none">{player}</p>
            <p className="font-invader text-gray-400 text-[18px] leading-none">{city}</p>
          </div>
          <p className="font-invader text-gray-300 text-[12px] leading-none">{`${timeAgo} | #${flashNumber}`}</p>
        </div>
      </div>

      <Image width={1920} height={1080} src={"https://invader-flashes.s3.amazonaws.com" + imageUrl} alt="flash" className="w-[60px] h-[60px] object-cover border border-gray-800" />
    </div>
  );
}
