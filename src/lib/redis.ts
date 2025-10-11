// Redis utilities for wishlist management
import { createClient } from 'redis';
import { WishlistItem, UserWishlist } from './wishlist';
import { getLocalImagePath } from './getImagePath';

// Create Redis client
let client: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!client) {
    if (!process.env.REDIS_URL) {
      console.error('[DEBUG] REDIS_URL environment variable is not set');
      throw new Error('REDIS_URL environment variable is not set');
    }
    
    console.log(`[DEBUG] Connecting to Redis at: ${process.env.REDIS_URL.replace(/\/\/.*@/, '//***@')}`);
    
    client = createClient({
      url: process.env.REDIS_URL,
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      console.log('[DEBUG] Redis client connected successfully');
    });

    await client.connect();
  }

  return client;
}

// Redis key pattern for wishlists
const WISHLIST_KEY = (fid: number) => `wishlist:${fid}`;

// Get user's wishlist from Redis
export async function getWishlistFromRedis(fid: number): Promise<UserWishlist> {
  try {
    const client = await getRedisClient();
    const stored = await client.get(WISHLIST_KEY(fid));
    
    if (!stored) {
      return getEmptyWishlist(fid);
    }
    
    const parsed = JSON.parse(stored) as UserWishlist;
    return parsed;
  } catch (error) {
    console.error('Error loading wishlist from Redis:', error);
    return getEmptyWishlist(fid);
  }
}

// Save user's wishlist to Redis
export async function saveWishlistToRedis(wishlist: UserWishlist): Promise<void> {
  try {
    const client = await getRedisClient();
    
    // Update stats
    wishlist.stats = {
      total_wanted: wishlist.items.filter(item => item.status === 'want_to_find').length,
      total_found: wishlist.items.filter(item => item.status === 'alive' || item.status === 'dead').length,
      last_updated: new Date().toISOString()
    };
    
    await client.set(WISHLIST_KEY(wishlist.fid), JSON.stringify(wishlist));
  } catch (error) {
    console.error('Error saving wishlist to Redis:', error);
    throw error;
  }
}

// Add invader to wishlist in Redis
export async function addToWishlistRedis(
  fid: number, 
  invader: { 
    i: number; 
    n: string; 
    l: { lat: number; lng: number }; 
    t: string; 
  }
): Promise<UserWishlist> {
  const wishlist = await getWishlistFromRedis(fid);
  
  // Check if already in wishlist
  const existingIndex = wishlist.items.findIndex(item => item.invader_id === invader.n);
  
  if (existingIndex === -1) {
    // Add new item
    const newItem: WishlistItem = {
      invader_id: invader.n,
      invader_name: invader.n,
      photo_url: getLocalImagePath(invader),
      coordinates: {
        lat: invader.l.lat,
        lng: invader.l.lng
      },
      added_date: new Date().toISOString(),
      status: 'want_to_find'
    };
    
    wishlist.items.push(newItem);
  } else {
    // Update existing item to want_to_find if it was marked found
    wishlist.items[existingIndex].status = 'want_to_find';
    wishlist.items[existingIndex].added_date = new Date().toISOString();
  }
  
  await saveWishlistToRedis(wishlist);
  return wishlist;
}

// Remove invader from wishlist in Redis
export async function removeFromWishlistRedis(fid: number, invaderId: string): Promise<UserWishlist> {
  const wishlist = await getWishlistFromRedis(fid);
  wishlist.items = wishlist.items.filter(item => item.invader_id !== invaderId);
  await saveWishlistToRedis(wishlist);
  return wishlist;
}

// Mark invader as found in Redis
export async function markAsAliveRedis(fid: number, invaderId: string): Promise<UserWishlist> {
  const wishlist = await getWishlistFromRedis(fid);
  const item = wishlist.items.find(item => item.invader_id === invaderId);
  
  if (item) {
    item.status = 'alive';
  }
  
  await saveWishlistToRedis(wishlist);
  return wishlist;
}

export async function markAsDeadRedis(fid: number, invaderId: string): Promise<UserWishlist> {
  const wishlist = await getWishlistFromRedis(fid);
  const item = wishlist.items.find(item => item.invader_id === invaderId);
  
  if (item) {
    item.status = 'dead';
  }
  
  await saveWishlistToRedis(wishlist);
  return wishlist;
}

// Check if invader is in wishlist
export async function isInWishlistRedis(fid: number, invaderId: string): Promise<boolean> {
  const wishlist = await getWishlistFromRedis(fid);
  return wishlist.items.some(item => item.invader_id === invaderId);
}

// Get invader status from Redis
export async function getInvaderStatusRedis(fid: number, invaderId: string): Promise<'want_to_find' | 'alive' | 'dead' | null> {
  const wishlist = await getWishlistFromRedis(fid);
  const item = wishlist.items.find(item => item.invader_id === invaderId);
  return item ? item.status : null;
}

// Helper to create empty wishlist
function getEmptyWishlist(fid: number): UserWishlist {
  return {
    fid,
    items: [],
    stats: {
      total_wanted: 0,
      total_found: 0,
      last_updated: new Date().toISOString()
    }
  };
}

// Get wishlist stats from Redis
export async function getWishlistStatsRedis(fid: number) {
  const wishlist = await getWishlistFromRedis(fid);
  return {
    totalWanted: wishlist.stats.total_wanted,
    totalFound: wishlist.stats.total_found,
    totalItems: wishlist.items.length,
    completionRate: wishlist.stats.total_wanted > 0 
      ? Math.round((wishlist.stats.total_found / (wishlist.stats.total_wanted + wishlist.stats.total_found)) * 100)
      : 0
  };
}

// Experimental Users Management
const EXPERIMENTAL_USERS_KEY = 'experimental_users';

// Get all experimental users
export async function getExperimentalUsersRedis(): Promise<number[]> {
  try {
    const redis = await getRedisClient();
    const users = await redis.sMembers(EXPERIMENTAL_USERS_KEY);
    return Array.isArray(users) ? users.map(fid => parseInt(fid as string, 10)).filter(fid => !isNaN(fid)) : [];
  } catch (error) {
    console.error('Error getting experimental users:', error);
    return [];
  }
}

// Add user to experimental users
export async function addExperimentalUserRedis(fid: number): Promise<boolean> {
  try {
    const redis = await getRedisClient();
    const result = await redis.sAdd(EXPERIMENTAL_USERS_KEY, fid.toString());
    return result === 1; // Returns 1 if added, 0 if already exists
  } catch (error) {
    console.error('Error adding experimental user:', error);
    return false;
  }
}

// Remove user from experimental users
export async function removeExperimentalUserRedis(fid: number): Promise<boolean> {
  try {
    const redis = await getRedisClient();
    const result = await redis.sRem(EXPERIMENTAL_USERS_KEY, fid.toString());
    return result === 1; // Returns 1 if removed, 0 if didn't exist
  } catch (error) {
    console.error('Error removing experimental user:', error);
    return false;
  }
}

// Check if user is experimental
export async function isExperimentalUserRedis(fid: number): Promise<boolean> {
  try {
    const redis = await getRedisClient();
    const result = await redis.sIsMember(EXPERIMENTAL_USERS_KEY, fid.toString());
    return result === 1;
  } catch (error) {
    console.error('Error checking experimental user:', error);
    return false;
  }
}

// Cleanup Redis connection
export async function closeRedisConnection() {
  if (client) {
    await client.disconnect();
    client = null;
  }
}

// ================== FAVORITES MANAGEMENT ==================

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

export interface UserFavorites {
  fid: number;
  favorites: FavoriteFlash[];
  stats: {
    total_count: number;
    last_updated: string;
  };
}

// Redis key pattern for favorites
const FAVORITES_KEY = (fid: number) => `favorites:${fid}`;

// Get user's favorites from Redis
export async function getFavoritesFromRedis(fid: number): Promise<UserFavorites> {
  try {
    const client = await getRedisClient();
    const stored = await client.get(FAVORITES_KEY(fid));
    
    if (!stored) {
      return getEmptyFavorites(fid);
    }
    
    const parsed = JSON.parse(stored) as UserFavorites;
    return parsed;
  } catch (error) {
    console.error('Error loading favorites from Redis:', error);
    return getEmptyFavorites(fid);
  }
}

// Save user's favorites to Redis
export async function saveFavoritesToRedis(favorites: UserFavorites): Promise<void> {
  try {
    const client = await getRedisClient();
    
    // Update stats
    favorites.stats = {
      total_count: favorites.favorites.length,
      last_updated: new Date().toISOString()
    };
    
    await client.set(FAVORITES_KEY(favorites.fid), JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites to Redis:', error);
    throw error;
  }
}

// Add flash to favorites in Redis
export async function addToFavoritesRedis(fid: number, flash: Omit<FavoriteFlash, 'addedAt'>): Promise<boolean> {
  try {
    const userFavorites = await getFavoritesFromRedis(fid);
    
    // Check if already in favorites
    const exists = userFavorites.favorites.some(fav => fav.flash_id === flash.flash_id);
    if (exists) {
      return false; // Already exists
    }
    
    // Add new favorite
    const newFavorite: FavoriteFlash = {
      ...flash,
      addedAt: Date.now()
    };
    
    userFavorites.favorites.push(newFavorite);
    await saveFavoritesToRedis(userFavorites);
    return true;
  } catch (error) {
    console.error('Error adding to favorites in Redis:', error);
    throw error;
  }
}

// Remove flash from favorites in Redis
export async function removeFromFavoritesRedis(fid: number, flashId: number): Promise<boolean> {
  try {
    const userFavorites = await getFavoritesFromRedis(fid);
    const originalLength = userFavorites.favorites.length;
    
    userFavorites.favorites = userFavorites.favorites.filter(fav => fav.flash_id !== flashId);
    
    if (userFavorites.favorites.length === originalLength) {
      return false; // Item wasn't found
    }
    
    await saveFavoritesToRedis(userFavorites);
    return true;
  } catch (error) {
    console.error('Error removing from favorites in Redis:', error);
    throw error;
  }
}

// Check if flash is in favorites
export async function isFavoriteRedis(fid: number, flashId: number): Promise<boolean> {
  try {
    const userFavorites = await getFavoritesFromRedis(fid);
    return userFavorites.favorites.some(fav => fav.flash_id === flashId);
  } catch (error) {
    console.error('Error checking favorite status in Redis:', error);
    return false;
  }
}

// Get favorites count from Redis
export async function getFavoritesCountRedis(fid: number): Promise<number> {
  try {
    const userFavorites = await getFavoritesFromRedis(fid);
    return userFavorites.favorites.length;
  } catch (error) {
    console.error('Error getting favorites count from Redis:', error);
    return 0;
  }
}

// Helper to create empty favorites
function getEmptyFavorites(fid: number): UserFavorites {
  return {
    fid,
    favorites: [],
    stats: {
      total_count: 0,
      last_updated: new Date().toISOString()
    }
  };
}

// ================== FLASH LINKS MANAGEMENT ==================

export interface FlashLink {
  flash_id: number;
  invader_id: string;
  invader_name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  linked_date: string;
  city: string;
}

export interface UserFlashLinks {
  fid: number;
  links: FlashLink[];
  stats: {
    total_links: number;
    last_updated: string;
  };
}

// Redis key pattern for flash links
const FLASH_LINKS_KEY = (fid: number) => `flash_links:${fid}`;

// Get user's flash links from Redis
export async function getFlashLinksFromRedis(fid: number): Promise<UserFlashLinks> {
  try {
    const client = await getRedisClient();
    const stored = await client.get(FLASH_LINKS_KEY(fid));

    if (!stored) {
      return getEmptyFlashLinks(fid);
    }

    const parsed = JSON.parse(stored) as UserFlashLinks;
    return parsed;
  } catch (error) {
    console.error('Error loading flash links from Redis:', error);
    return getEmptyFlashLinks(fid);
  }
}

// Save user's flash links to Redis
export async function saveFlashLinksToRedis(flashLinks: UserFlashLinks): Promise<void> {
  try {
    const client = await getRedisClient();

    // Update stats
    flashLinks.stats = {
      total_links: flashLinks.links.length,
      last_updated: new Date().toISOString()
    };

    await client.set(FLASH_LINKS_KEY(flashLinks.fid), JSON.stringify(flashLinks));
  } catch (error) {
    console.error('Error saving flash links to Redis:', error);
    throw error;
  }
}

// Link flash to invader in Redis
export async function linkFlashToInvaderRedis(
  fid: number,
  flashId: number,
  invader: {
    i: number;
    n: string;
    l: { lat: number; lng: number };
    t: string;
  },
  city: string
): Promise<UserFlashLinks> {
  try {
    const userLinks = await getFlashLinksFromRedis(fid);

    // Check if flash is already linked to any invader
    const existingLinkIndex = userLinks.links.findIndex(link => link.flash_id === flashId);

    if (existingLinkIndex !== -1) {
      // Update existing link
      userLinks.links[existingLinkIndex] = {
        flash_id: flashId,
        invader_id: invader.n,
        invader_name: invader.n,
        coordinates: {
          lat: invader.l.lat,
          lng: invader.l.lng
        },
        linked_date: new Date().toISOString(),
        city
      };
    } else {
      // Add new link
      const newLink: FlashLink = {
        flash_id: flashId,
        invader_id: invader.n,
        invader_name: invader.n,
        coordinates: {
          lat: invader.l.lat,
          lng: invader.l.lng
        },
        linked_date: new Date().toISOString(),
        city
      };

      userLinks.links.push(newLink);
    }

    await saveFlashLinksToRedis(userLinks);
    return userLinks;
  } catch (error) {
    console.error('Error linking flash to invader in Redis:', error);
    throw error;
  }
}

// Unlink flash from invader in Redis
export async function unlinkFlashFromInvaderRedis(fid: number, flashId: number): Promise<UserFlashLinks> {
  try {
    const userLinks = await getFlashLinksFromRedis(fid);
    userLinks.links = userLinks.links.filter(link => link.flash_id !== flashId);
    await saveFlashLinksToRedis(userLinks);
    return userLinks;
  } catch (error) {
    console.error('Error unlinking flash from invader in Redis:', error);
    throw error;
  }
}

// Get links for specific invader
export async function getInvaderLinksRedis(fid: number, invaderId: string): Promise<FlashLink[]> {
  try {
    const userLinks = await getFlashLinksFromRedis(fid);
    return userLinks.links.filter(link => link.invader_id === invaderId);
  } catch (error) {
    console.error('Error getting invader links from Redis:', error);
    return [];
  }
}

// Get link for specific flash
export async function getFlashLinkRedis(fid: number, flashId: number): Promise<FlashLink | null> {
  try {
    const userLinks = await getFlashLinksFromRedis(fid);
    return userLinks.links.find(link => link.flash_id === flashId) || null;
  } catch (error) {
    console.error('Error getting flash link from Redis:', error);
    return null;
  }
}

// Check if flash is linked
export async function isFlashLinkedRedis(fid: number, flashId: number): Promise<boolean> {
  try {
    const userLinks = await getFlashLinksFromRedis(fid);
    return userLinks.links.some(link => link.flash_id === flashId);
  } catch (error) {
    console.error('Error checking flash link status in Redis:', error);
    return false;
  }
}

// Get count of links for an invader
export async function getInvaderLinkCountRedis(fid: number, invaderId: string): Promise<number> {
  try {
    const userLinks = await getFlashLinksFromRedis(fid);
    return userLinks.links.filter(link => link.invader_id === invaderId).length;
  } catch (error) {
    console.error('Error getting invader link count from Redis:', error);
    return 0;
  }
}

// Helper to create empty flash links
function getEmptyFlashLinks(fid: number): UserFlashLinks {
  return {
    fid,
    links: [],
    stats: {
      total_links: 0,
      last_updated: new Date().toISOString()
    }
  };
}