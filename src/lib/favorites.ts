// Client-side favorites management using Redis via API
import { getResource, postResource } from './resourceClient';

export interface FavoriteFlash {
  flash_id: number;
  player: string;
  city: string;
  timestamp: number;
  img?: string;
  ipfs_cid?: string;
  text?: string;
  addedAt: number;
}

// Get user's favorites from Redis via API
export async function getFavorites(fid?: number): Promise<FavoriteFlash[]> {
  if (!fid) {
    throw new Error('Farcaster ID is required to load favorites');
  }

  const userFavorites = await getResource<{ favorites?: FavoriteFlash[] }>(
    '/api/favorites',
    { fid },
    'Failed to load favorites'
  );
  return userFavorites.favorites || [];
}

// Add flash to favorites via API
export async function addToFavorites(flash: Omit<FavoriteFlash, 'addedAt'>, fid?: number): Promise<boolean> {
  if (!fid) {
    throw new Error('Farcaster ID is required to add favorites');
  }

  const result = await postResource<{ success: boolean }>(
    '/api/favorites',
    { fid, action: 'add', flash },
    'Failed to add to favorites'
  );
  return result.success;
}

// Remove flash from favorites via API
export async function removeFromFavorites(flashId: number, fid?: number): Promise<boolean> {
  if (!fid) {
    throw new Error('Farcaster ID is required to remove favorites');
  }

  const result = await postResource<{ success: boolean }>(
    '/api/favorites',
    { fid, action: 'remove', flashId },
    'Failed to remove from favorites'
  );
  return result.success;
}

// Check if flash is favorite via API
export async function isFavorite(flashId: number, fid?: number): Promise<boolean> {
  if (!fid) {
    return false; // Not signed in, can't have favorites
  }

  const result = await getResource<{ isFavorite: boolean }>(
    '/api/favorites',
    { fid, flashId },
    'Failed to check favorite status'
  );
  return result.isFavorite;
}

// Get favorites count via API
export async function getFavoritesCount(fid?: number): Promise<number> {
  if (!fid) {
    return 0; // Not signed in, no favorites
  }

  const result = await getResource<{ count: number }>(
    '/api/favorites',
    { fid, count: true },
    'Failed to get favorites count'
  );
  return result.count;
}
