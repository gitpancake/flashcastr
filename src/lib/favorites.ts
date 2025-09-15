// Client-side favorites management using Redis via API with localStorage fallback
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

const FAVORITES_KEY = 'flashcastr_favorites';

// Get user's favorites from Redis via API with localStorage fallback
export async function getFavorites(fid?: number): Promise<FavoriteFlash[]> {
  if (fid) {
    try {
      const response = await fetch(`/api/favorites?fid=${fid}`);
      if (response.ok) {
        const userFavorites = await response.json();
        return userFavorites.favorites || [];
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error loading favorites from API, falling back to localStorage:', error);
    }
  }
  
  // Fallback to localStorage
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading favorites from localStorage:', error);
    return [];
  }
}

// Legacy sync function for localStorage (for compatibility)
export function getFavoritesSync(): FavoriteFlash[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
}

// Add flash to favorites via API with localStorage fallback
export async function addToFavorites(flash: Omit<FavoriteFlash, 'addedAt'>, fid?: number): Promise<boolean> {
  if (fid) {
    try {
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
      
      if (response.ok) {
        const result = await response.json();
        return result.success;
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error adding to favorites via API, falling back to localStorage:', error);
    }
  }
  
  // Fallback to localStorage
  try {
    const favorites = getFavoritesSync();
    const exists = favorites.some(fav => fav.flash_id === flash.flash_id);
    
    if (exists) return false;
    
    const newFavorite: FavoriteFlash = {
      ...flash,
      addedAt: Date.now()
    };
    
    favorites.push(newFavorite);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
}

// Legacy sync function for localStorage (for compatibility)
export function addToFavoritesSync(flash: Omit<FavoriteFlash, 'addedAt'>): boolean {
  try {
    const favorites = getFavoritesSync();
    const exists = favorites.some(fav => fav.flash_id === flash.flash_id);
    
    if (exists) return false;
    
    const newFavorite: FavoriteFlash = {
      ...flash,
      addedAt: Date.now()
    };
    
    favorites.push(newFavorite);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
}

// Remove flash from favorites via API with localStorage fallback
export async function removeFromFavorites(flashId: number, fid?: number): Promise<boolean> {
  if (fid) {
    try {
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
      
      if (response.ok) {
        const result = await response.json();
        return result.success;
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error removing from favorites via API, falling back to localStorage:', error);
    }
  }
  
  // Fallback to localStorage
  try {
    const favorites = getFavoritesSync();
    const filtered = favorites.filter(fav => fav.flash_id !== flashId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
}

// Legacy sync function for localStorage (for compatibility)
export function removeFromFavoritesSync(flashId: number): boolean {
  try {
    const favorites = getFavoritesSync();
    const filtered = favorites.filter(fav => fav.flash_id !== flashId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
}

// Check if flash is favorite via API with localStorage fallback
export async function isFavorite(flashId: number, fid?: number): Promise<boolean> {
  if (fid) {
    try {
      const response = await fetch(`/api/favorites?fid=${fid}&flashId=${flashId}`);
      if (response.ok) {
        const result = await response.json();
        return result.isFavorite;
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error checking favorite status via API, falling back to localStorage:', error);
    }
  }
  
  // Fallback to localStorage
  const favorites = getFavoritesSync();
  return favorites.some(fav => fav.flash_id === flashId);
}

// Legacy sync function for localStorage (for compatibility)
export function isFavoriteSync(flashId: number): boolean {
  const favorites = getFavoritesSync();
  return favorites.some(fav => fav.flash_id === flashId);
}

// Get favorites count via API with localStorage fallback
export async function getFavoritesCount(fid?: number): Promise<number> {
  if (fid) {
    try {
      const response = await fetch(`/api/favorites?fid=${fid}&count=true`);
      if (response.ok) {
        const result = await response.json();
        return result.count;
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error getting favorites count via API, falling back to localStorage:', error);
    }
  }
  
  // Fallback to localStorage
  return getFavoritesSync().length;
}

// Legacy sync function for localStorage (for compatibility)
export function getFavoritesCountSync(): number {
  return getFavoritesSync().length;
}