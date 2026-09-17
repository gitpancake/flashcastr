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

type ShareTarget = "farcaster" | "twitter";

const SHARE_TARGET_URLS: Record<ShareTarget, (encodedText: string) => string> = {
  farcaster: (encodedText) => `https://warpcast.com/~/compose?text=${encodedText}`,
  twitter: (encodedText) => `https://twitter.com/intent/tweet?text=${encodedText}`,
};

function shareTo(target: ShareTarget, { flash, currentUrl }: ShareOptions) {
  const shareText = generateShareText({ flash, currentUrl });
  const encodedText = encodeURIComponent(shareText);
  const url = SHARE_TARGET_URLS[target](encodedText);
  window.open(url, '_blank');
}

export function shareToFarcaster(options: ShareOptions) {
  shareTo("farcaster", options);
}

export function shareToTwitter(options: ShareOptions) {
  shareTo("twitter", options);
}

export async function copyToClipboard({ flash, currentUrl }: ShareOptions): Promise<boolean> {
  try {
    const shareText = generateShareText({ flash, currentUrl });

    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareText);
      return true;
    }

    // Fallback to older method
    const textArea = document.createElement('textarea');
    textArea.value = shareText;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      console.error('Fallback copy failed:', err);
      return false;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}