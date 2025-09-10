// Client-side favorites management using localStorage
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

export function getFavorites(): FavoriteFlash[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
}

export function addToFavorites(flash: Omit<FavoriteFlash, 'addedAt'>): boolean {
  try {
    const favorites = getFavorites();
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

export function removeFromFavorites(flashId: number): boolean {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(fav => fav.flash_id !== flashId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
}

export function isFavorite(flashId: number): boolean {
  const favorites = getFavorites();
  return favorites.some(fav => fav.flash_id === flashId);
}

export function getFavoritesCount(): number {
  return getFavorites().length;
}