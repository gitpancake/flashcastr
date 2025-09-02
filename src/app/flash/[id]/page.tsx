import { notFound } from "next/navigation";
import { fromUnixTime } from "date-fns";
import type { Metadata } from "next";
import { InvadersFunApi } from "~/lib/api.invaders.fun/flashes";
import formatTimeAgo from "~/lib/help/formatTimeAgo";
import { getImageUrl } from "~/lib/help/getImageUrl";
import FlashPageClient from "./FlashPageClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const invadersApi = new InvadersFunApi();
    const flash = await invadersApi.getGlobalFlash(Number(id));

    if (!flash) {
      return {
        title: "Flash Not Found | Flashcastr",
        description: "The requested flash could not be found."
      };
    }

    const imageUrl = getImageUrl(flash);
    const title = `Flash #${flash.flash_id} by ${flash.player} | Flashcastr`;
    const description = flash.text 
      ? `${flash.text} - Flash from ${flash.city} by ${flash.player}`
      : `Space Invaders flash from ${flash.city} by ${flash.player}`;

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
        title: `View Flash #${flash.flash_id}`,
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
            alt: `Flash #${flash.flash_id} by ${flash.player}`,
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
