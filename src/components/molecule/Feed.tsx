import { fromUnixTime } from "date-fns";
import { Flashes } from "~/lib/mongodb/flashes";
import { players } from "~/lib/players";
import FlashCard from "./FlashCard";
import SearchBar from "./SearchBar";
import SectionTitle from "./SectionTitle";

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return "JUST NOW";
  if (diff < 3600) return `${Math.floor(diff / 60)}M AGO`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} HR AGO`;
  if (diff < 172800) return "YESTERDAY";
  return `${Math.floor(diff / 86400)} DAYS AGO`;
}

export default async function Feed() {
  const recents = await new Flashes().getMany({
    player: {
      $in: players.map((player) => player.username),
    },
  });

  return (
    <div className="h-screen w-screen bg-black flex animate-fade-in justify-center overflow-y-auto">
      <div className="flex flex-col gap-4 p-4 w-full max-w-2xl">
        <SearchBar />
        <SectionTitle>Recent Flashes</SectionTitle>
        {recents.map((flash) => (
          <FlashCard
            key={flash.flash_id.toString()}
            player={players.find((player) => player.username === flash.player)?.fid.toString()}
            city={flash.city}
            timeAgo={formatTimeAgo(fromUnixTime(flash.timestamp))}
            flashNumber={flash.flash_id.toLocaleString()}
            imageUrl={flash.img}
          />
        ))}
      </div>
    </div>
  );
}
