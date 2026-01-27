import { IPFS } from "~/lib/constants";

interface FlashImageData {
  ipfs_cid?: string;
}

/**
 * Get the IPFS image URL for a flash
 * @param flash - Flash data containing IPFS CID
 * @returns IPFS image URL
 */
export function getImageUrl(flash: FlashImageData): string {
  if (!flash.ipfs_cid?.trim()) {
    console.warn('Flash missing IPFS CID:', flash);
    return '';
  }
  
  // IPFS.GATEWAY already includes /ipfs/ path
  return `${IPFS.GATEWAY}${flash.ipfs_cid}`;
}