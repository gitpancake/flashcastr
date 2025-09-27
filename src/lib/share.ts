import { GlobalFlash } from "./api.flashcastr.app/globalFlashes";

export interface ShareOptions {
  flash: GlobalFlash;
  currentUrl: string;
}

export function generateShareText({ flash, currentUrl }: ShareOptions): string {
  const text = `[>] Space Invaders Flash #${flash.flash_id}

[IMG] by @${flash.player}
[LOC] ${flash.city}${flash.text ? `\n[TXT] "${flash.text}"` : ''}

Check it out on Flashcastr
${currentUrl}`;

  return text;
}

export function shareToFarcaster({ flash, currentUrl }: ShareOptions) {
  const shareText = generateShareText({ flash, currentUrl });
  const encodedText = encodeURIComponent(shareText);
  const farcasterUrl = `https://warpcast.com/~/compose?text=${encodedText}`;
  window.open(farcasterUrl, '_blank');
}

export function shareToTwitter({ flash, currentUrl }: ShareOptions) {
  const shareText = generateShareText({ flash, currentUrl });
  const encodedText = encodeURIComponent(shareText);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
  window.open(twitterUrl, '_blank');
}

export async function copyToClipboard({ flash, currentUrl }: ShareOptions): Promise<boolean> {
  try {
    const shareText = generateShareText({ flash, currentUrl });
    await navigator.clipboard.writeText(shareText);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}