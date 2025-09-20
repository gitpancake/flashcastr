interface InvaderImageData {
  n: string; // name like "FAO_03"
  t: string; // original remote URL
}

/**
 * Transforms an invader's remote image URL to a local path
 * @param invader - Invader object with name (n) and remote URL (t)
 * @returns Local path to the image in public/invaders directory
 */
export function getLocalImagePath(invader: InvaderImageData): string {
  // Extract city code from name (e.g., "FAO_03" -> "FAO")
  const cityCode = invader.n.split('_')[0];
  
  // Extract file extension from original URL
  const urlParts = invader.t.split('.');
  const extension = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params if any
  
  // Build local path: /invaders/CITY/NAME.EXTENSION
  const localPath = `/invaders/${cityCode}/${invader.n}.${extension}`;
  
  return localPath;
}

/**
 * Transforms an invader's remote image URL to a local path with fallback
 * @param invader - Invader object with name (n) and remote URL (t)
 * @param useFallback - If true, will fallback to remote URL on error (default: false)
 * @returns Local path or remote URL as fallback
 */
export function getImagePathWithFallback(invader: InvaderImageData, useFallback: boolean = false): string {
  try {
    return getLocalImagePath(invader);
  } catch (error) {
    console.warn(`Failed to generate local path for ${invader.n}, using remote URL:`, error);
    return useFallback ? invader.t : getLocalImagePath(invader);
  }
}