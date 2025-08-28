import { notFound } from "next/navigation";
import { fromUnixTime } from "date-fns";
import { InvadersFunApi } from "~/lib/api.invaders.fun/flashes";
import formatTimeAgo from "~/lib/help/formatTimeAgo";
import FlashPageClient from "./FlashPageClient";

export default async function FlashPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  try {
    const invadersApi = new InvadersFunApi();
    const flash = await invadersApi.getGlobalFlash(Number(id));

    if (!flash) {
      console.error(`Flash not found for ID: ${id}`);
      return notFound();
    }

    // Check if flash has the required structure
    if (!flash.timestamp) {
      console.error('Flash data structure is invalid:', flash);
      return notFound();
    }

    const timestampSeconds = Math.floor(flash.timestamp / 1000);
    const timestamp = fromUnixTime(timestampSeconds);
    const timeAgo = formatTimeAgo(timestamp);

    return (
      <FlashPageClient 
        flash={flash}
        timeAgo={timeAgo}
      />
    );
  } catch (error) {
    console.error('Error loading flash:', error);
    return notFound();
  }
}
