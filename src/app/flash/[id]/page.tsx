import { notFound } from "next/navigation";
import { fromUnixTime } from "date-fns";
import type { Metadata } from "next";
import { InvadersFunApi, GlobalFlash } from "~/lib/api.invaders.fun/flashes";
import { FlashesApi, FlashData } from "~/lib/api.flashcastr.app/flashes";
import formatTimeAgo from "~/lib/help/formatTimeAgo";
import { getImageUrl } from "~/lib/help/getImageUrl";
import FlashPageClient from "./FlashPageClient";

// Type guard to check if flash has text property (GlobalFlash vs FlashData)
function hasTextProperty(flash: GlobalFlash | FlashData): flash is GlobalFlash {
  return 'text' in flash;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    let flashResponse = null;
    let flash;
    let playerName;

    // Try FlashesApi first to get Farcaster username (with error handling)
    try {
      const flashcastrApi = new FlashesApi();
      flashResponse = await flashcastrApi.getFlashById(Number(id));
    } catch (error) {
      console.log('FlashesApi failed for metadata, falling back to InvadersFunApi:', error);
      // Continue to fallback, don't throw
    }

    if (flashResponse) {
      // We have Farcaster data
      flash = flashResponse.flash;
      playerName = flashResponse.user_username || flashResponse.flash.player;
    } else {
      // Fallback to InvadersFunApi
      const invadersApi = new InvadersFunApi();
      flash = await invadersApi.getGlobalFlash(Number(id));
      playerName = flash?.player;
    }

    if (!flash) {
      return {
        title: "Flash Not Found | Flashcastr",
        description: "The requested flash could not be found."
      };
    }

    const imageUrl = getImageUrl(flash);
    const title = `Flash #${flash.flash_id} by ${playerName} | Flashcastr`;
    const description = hasTextProperty(flash) && flash.text 
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
            alt: `Flash #${flash.flash_id} by ${playerName}`,
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
    let flashResponse = null;
    
    // Try FlashesApi first to get Farcaster username (with error handling)
    try {
      const flashcastrApi = new FlashesApi();
      flashResponse = await flashcastrApi.getFlashById(Number(id));
    } catch (error) {
      console.log('FlashesApi failed, falling back to InvadersFunApi:', error);
      // Continue to fallback, don't throw
    }

    if (flashResponse) {
      // We have Farcaster data, use it
      const timestampSeconds = Math.floor(flashResponse.flash.timestamp / 1000);
      const timestamp = fromUnixTime(timestampSeconds);
      const timeAgo = formatTimeAgo(timestamp);

      // Create a combined flash object with Farcaster username
      const flashWithFarcaster = {
        ...flashResponse.flash,
        text: '', // FlashData doesn't have text field, but GlobalFlash expects it
        farcaster_username: flashResponse.user_username,
        farcaster_pfp: flashResponse.user_pfp_url,
        farcaster_fid: flashResponse.user_fid
      };

      return (
        <FlashPageClient 
          flash={flashWithFarcaster}
          timeAgo={timeAgo}
        />
      );
    }

    // Fallback to InvadersFunApi if not found in FlashesApi or FlashesApi failed
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
