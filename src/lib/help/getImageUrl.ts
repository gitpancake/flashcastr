import { IPFS, S3 } from "~/lib/constants";

interface FlashImageData {
  img?: string;
  ipfs_cid?: string;
}

/**
 * Get the image URL for a flash, preferring IPFS over S3
 * @param flash - Flash data containing image information
 * @returns Optimized image URL with IPFS preference and S3 fallback
 */
export function getImageUrl(flash: FlashImageData): string {
  // Early return for IPFS if available - critical path optimization
  if (flash.ipfs_cid?.trim()) {
    // IPFS.GATEWAY already includes /ipfs/ path
    return `${IPFS.GATEWAY}${flash.ipfs_cid}`;
  }
  
  // Fallback to S3 URL - maintain original concatenation format
  return `${S3.BASE_URL}${flash.img || ''}`;
}