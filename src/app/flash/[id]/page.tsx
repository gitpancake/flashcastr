import { notFound } from "next/navigation";
import { fromUnixTime } from "date-fns";
import { FlashesApi } from "~/lib/api.flashcastr.app/flashes";
import formatTimeAgo from "~/lib/help/formatTimeAgo";
import FlashPageClient from "./FlashPageClient";

export default async function FlashPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const flashesApi = new FlashesApi();
  const flash = await flashesApi.getFlashById(id);

  if (!flash) return notFound();

  const timestampSeconds = Math.floor(flash.flash.timestamp / 1000);
  const timestamp = fromUnixTime(timestampSeconds);
  const timeAgo = formatTimeAgo(timestamp);

  return (
    <FlashPageClient 
      flash={flash}
      timeAgo={timeAgo}
    />
  );
}
