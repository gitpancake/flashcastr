// Client-side favorites management using Redis via API
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
  
  const response = await fetch(`/api/favorites?fid=${fid}`);
  if (!response.ok) {
    throw new Error(`Failed to load favorites: ${response.status}`);
  }
  
  const userFavorites = await response.json();
  return userFavorites.favorites || [];
}

// Add flash to favorites via API
export async function addToFavorites(flash: Omit<FavoriteFlash, 'addedAt'>, fid?: number): Promise<boolean> {
  if (!fid) {
    throw new Error('Farcaster ID is required to add favorites');
  }
  
  const response = await fetch('/api/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fid,
      action: 'add',
      flash
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to add to favorites: ${response.status}`);
  }
  
  const result = await response.json();
  return result.success;
}

// Remove flash from favorites via API
export async function removeFromFavorites(flashId: number, fid?: number): Promise<boolean> {
  if (!fid) {
    throw new Error('Farcaster ID is required to remove favorites');
  }
  
  const response = await fetch('/api/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fid,
      action: 'remove',
      flashId
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to remove from favorites: ${response.status}`);
  }
  
  const result = await response.json();
  return result.success;
}

// Check if flash is favorite via API
export async function isFavorite(flashId: number, fid?: number): Promise<boolean> {
  if (!fid) {
    return false; // Not signed in, can't have favorites
  }
  
  const response = await fetch(`/api/favorites?fid=${fid}&flashId=${flashId}`);
  if (!response.ok) {
    throw new Error(`Failed to check favorite status: ${response.status}`);
  }
  
  const result = await response.json();
  return result.isFavorite;
}

// Get favorites count via API
export async function getFavoritesCount(fid?: number): Promise<number> {
  if (!fid) {
    return 0; // Not signed in, no favorites
  }
  
  const response = await fetch(`/api/favorites?fid=${fid}&count=true`);
  if (!response.ok) {
    throw new Error(`Failed to get favorites count: ${response.status}`);
  }
  
  const result = await response.json();
  return result.count;
}