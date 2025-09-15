// Redis utilities for wishlist management
import { createClient } from 'redis';
import { WishlistItem, UserWishlist } from './wishlist';

// Create Redis client
let client: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!client) {
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL environment variable is not set');
    }
    
    client = createClient({
      url: process.env.REDIS_URL,
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
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
      total_found: wishlist.items.filter(item => item.status === 'found').length,
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
      photo_url: invader.t,
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
export async function markAsFoundRedis(fid: number, invaderId: string): Promise<UserWishlist> {
  const wishlist = await getWishlistFromRedis(fid);
  const item = wishlist.items.find(item => item.invader_id === invaderId);
  
  if (item) {
    item.status = 'found';
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
export async function getInvaderStatusRedis(fid: number, invaderId: string): Promise<'want_to_find' | 'found' | null> {
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

// Cleanup Redis connection
export async function closeRedisConnection() {
  if (client) {
    await client.disconnect();
    client = null;
  }
}