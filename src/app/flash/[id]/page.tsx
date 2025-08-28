import { notFound } from "next/navigation";
import { fromUnixTime } from "date-fns";
import { FlashesApi } from "~/lib/api.flashcastr.app/flashes";
import formatTimeAgo from "~/lib/help/formatTimeAgo";
import FlashPageClient from "./FlashPageClient";

export default async function FlashPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  try {
    const flashesApi = new FlashesApi();
    const flash = await flashesApi.getFlashById(id);

    if (!flash) {
      console.error(`Flash not found for ID: ${id}`);
      return notFound();
    }

    // Check if flash has the required structure
    if (!flash.flash || !flash.flash.timestamp) {
      console.error('Flash data structure is invalid:', flash);
      return notFound();
    }

    const timestampSeconds = Math.floor(flash.flash.timestamp / 1000);
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
