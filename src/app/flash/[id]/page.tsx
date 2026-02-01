import { notFound } from "next/navigation";
import { fromUnixTime } from "date-fns";
import type { Metadata } from "next";
import { UnifiedFlashesApi, UnifiedFlash } from "~/lib/api.flashcastr.app/globalFlashes";
import formatTimeAgo from "~/lib/help/formatTimeAgo";
import { IPFS } from "~/lib/constants";
import FlashPageClient from "./FlashPageClient";

function getFlashImageUrl(flash: UnifiedFlash): string {
  if (!flash.ipfs_cid?.trim()) {
    return '';
  }
  return `${IPFS.GATEWAY}${flash.ipfs_cid}`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  try {
    const api = new UnifiedFlashesApi();
    const flash = await api.getUnifiedFlash(Number(id));

    if (!flash) {
      return {
        title: "Flash Not Found | Flashcastr",
        description: "The requested flash could not be found."
      };
    }

    // Use Farcaster username if available, otherwise player name
    const playerName = flash.farcaster_user?.username || flash.player;
    // Use identification name if available and confidence is high
    const flashName = flash.identification?.confidence && flash.identification.confidence >= 0.8
      ? flash.identification.matched_flash_name
      : null;

    const imageUrl = getFlashImageUrl(flash);
    const title = flashName
      ? `${flashName} by ${playerName} | Flashcastr`
      : `Flash #${flash.flash_id} by ${playerName} | Flashcastr`;
    const description = flash.text
      ? `${flash.text} - Flash from ${flash.city} by ${playerName}`
      : `Space Invaders flash from ${flash.city} by ${playerName}`;

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://flashcastr.app';
    const url = `${baseUrl}/flash/${id}`;
    const appName = process.env.NEXT_PUBLIC_FRAME_NAME || "Flashcastr";
    const splashImageUrl = `${baseUrl}/splash.png`;
    const iconUrl = `${baseUrl}/icon.png`;

    // Frame preview metadata for Farcaster mini app
    const framePreviewMetadata = {
      version: "next",
      imageUrl: imageUrl,
      button: {
        title: flashName ? `View ${flashName}` : `View Flash #${flash.flash_id}`,
        action: {
          type: "launch_frame",
          name: appName,
          url: url,
          splashImageUrl,
          iconUrl,
          splashBackgroundColor: "#000",
        },
      },
    };

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 800,
            alt: flashName ? `${flashName} by ${playerName}` : `Flash #${flash.flash_id} by ${playerName}`,
          }
        ],
        url,
        siteName: "Flashcastr",
        type: "article",
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
        creator: "@flashcastr",
        site: "@flashcastr",
      },
      alternates: {
        canonical: url,
      },
      other: {
        "fc:frame": JSON.stringify(framePreviewMetadata),
      },
    };
  } catch (error) {
    console.error('Error generating metadata for flash:', error);
    return {
      title: "Flash | Flashcastr",
      description: "Space Invaders flash photo"
    };
  }
}

export default async function FlashPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const api = new UnifiedFlashesApi();
    const flash = await api.getUnifiedFlash(Number(id));

    if (!flash) {
      console.error(`Flash not found for ID: ${id}`);
      return notFound();
    }

    if (!flash.timestamp) {
      console.error('Flash data structure is invalid:', flash);
      return notFound();
    }

    const timestampSeconds = Math.floor(flash.timestamp / 1000);
    const timestamp = fromUnixTime(timestampSeconds);
    const timeAgo = formatTimeAgo(timestamp);

    // Transform to the format expected by FlashPageClient
    const flashForClient = {
      flash_id: flash.flash_id,
      city: flash.city || '',
      player: flash.player || '',
      img: flash.img || '',
      ipfs_cid: flash.ipfs_cid || undefined,
      text: flash.text || '',
      timestamp: flash.timestamp,
      farcaster_username: flash.farcaster_user?.username || undefined,
      farcaster_pfp: flash.farcaster_user?.pfp_url || undefined,
      farcaster_fid: flash.farcaster_user?.fid || undefined,
      cast_hash: flash.farcaster_user?.cast_hash || undefined,
      identification: flash.identification || undefined,
    };

    console.log(`Flash ${id}: Loaded via unified API${flash.farcaster_user ? ` (Farcaster: ${flash.farcaster_user.username})` : ''}${flash.identification ? ` (ID: ${flash.identification.matched_flash_name})` : ''}`);

    return (
      <FlashPageClient
        flash={flashForClient}
        timeAgo={timeAgo}
      />
    );
  } catch (error) {
    console.error('Error loading flash:', error);
    return notFound();
  }
}
