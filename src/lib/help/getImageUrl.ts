import { IPFS, S3 } from "~/lib/constants";

interface FlashImageData {
  img?: string;
  ipfs_cid?: string;
}

/**
 * Get the image URL for a flash, preferring IPFS over S3
 */
export function getImageUrl(flash: FlashImageData): string {
  // If IPFS CID is available, use IPFS gateway
  if (flash.ipfs_cid) {
    // IPFS.GATEWAY already includes /ipfs/ path
    return `${IPFS.GATEWAY}${flash.ipfs_cid}`;
  }
  
  // Fallback to S3 URL
  return `${S3.BASE_URL}${flash.img || ''}`;
}