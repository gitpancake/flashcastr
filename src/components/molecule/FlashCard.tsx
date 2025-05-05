import { Ref } from "react";

interface FlashCardProps {
  player?: string;
  city: string;
  timeAgo: string;
  flashNumber: string;
  imageUrl: string;
  ref: Ref<HTMLDivElement>;
}

const AVATAR_PLACEHOLDER = "/splash.png"; // Adjust path as needed

export default function FlashCard({ player, city, timeAgo, flashNumber, imageUrl, ref }: FlashCardProps) {
  return (
    <div className="bg-[#1E1E1E] p-2 flex items-center justify-between w-full max-w-xl max-h-[80px]" ref={ref}>
      <div className="flex items-start gap-3">
        <img src={AVATAR_PLACEHOLDER} alt="avatar" className="w-[30px] h-[30px] object-cover shadow-lg" />

        <div className="flex flex-col gap-2 h-full">
          <div className="flex flex-col gap-0">
            <p className="font-invader text-white text-[36px] leading-none">{player}</p>
            <p className="font-invader text-gray-400 text-[18px] leading-none">{city}</p>
          </div>
          <p className="font-invader text-gray-300 text-[12px] leading-none">{`${timeAgo} | #${flashNumber}`}</p>
        </div>
      </div>

      <img src={"https://invader-flashes.s3.amazonaws.com" + imageUrl} alt="flash" className="w-[60px] h-[60px] object-cover border border-gray-800" />
    </div>
  );
}
