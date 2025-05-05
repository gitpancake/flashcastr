interface FlashCardProps {
  player?: string;
  city: string;
  timeAgo: string;
  flashNumber: string;
  imageUrl: string;
}

const AVATAR_PLACEHOLDER = "/splash.png"; // Adjust path as needed

export default function FlashCard({ player, city, timeAgo, flashNumber, imageUrl }: FlashCardProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-between w-full max-w-xl">
      <div className="flex items-start gap-3">
        <img src={AVATAR_PLACEHOLDER} alt="avatar" className="w-8 h-8 rounded-sm object-cover border border-gray-700" />
        <div className="flex flex-col">
          <span className="font-invader text-white text-xl leading-none">{player}</span>
          <span className="font-invader text-gray-400 text-sm leading-none mb-2">{city}</span>
          <span className="text-xs text-gray-300 font-mono tracking-wide mt-1">{`${timeAgo} - FLASH #${flashNumber}`}</span>
        </div>
      </div>
      <img src={"https://invader-flashes.s3.amazonaws.com" + imageUrl} alt="flash" className="w-20 h-20 object-cover rounded-md border border-gray-800 ml-4" />
    </div>
  );
}
