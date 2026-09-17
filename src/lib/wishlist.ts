// Invader Hunt Wishlist Management
// Stores user's wishlist in Redis via API endpoints

import { getResource, postResource } from './resourceClient';

export interface WishlistItem {
  invader_id: string; // e.g., "TK_132"
  invader_name: string; // e.g., "TK_132"
  photo_url: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  added_date: string; // ISO date string
  status: 'want_to_find' | 'alive' | 'dead'; // Expanded to support alive/dead tracking
}

export interface UserWishlist {
  fid: number;
  items: WishlistItem[];
  stats: {
    total_wanted: number;
    total_found: number;
    last_updated: string;
  };
}

// Get user's wishlist from Redis via API
export async function getWishlist(fid: number): Promise<UserWishlist> {
  return getResource<UserWishlist>('/api/wishlist', { fid }, 'Failed to load wishlist');
}


// Add invader to wishlist via API
export async function addToWishlist(
  fid: number,
  invader: {
    i: number;
    n: string;
    l: { lat: number; lng: number };
    t: string;
  }
): Promise<UserWishlist> {
  return postResource<UserWishlist>(
    '/api/wishlist',
    { fid, action: 'add', invader },
    'Failed to add to wishlist'
  );
}

// Remove invader from wishlist via API
export async function removeFromWishlist(fid: number, invaderId: string): Promise<UserWishlist> {
  return postResource<UserWishlist>(
    '/api/wishlist',
    { fid, action: 'remove', invaderId },
    'Failed to remove from wishlist'
  );
}

// Mark invader as found via API
export async function markAsFound(fid: number, invaderId: string): Promise<UserWishlist> {
  return postResource<UserWishlist>(
    '/api/wishlist',
    { fid, action: 'mark_found', invaderId },
    'Failed to mark as found'
  );
}

// Check if invader is in wishlist
export async function isInWishlist(fid: number, invaderId: string): Promise<boolean> {
  const status = await getInvaderStatus(fid, invaderId);
  return status !== null;
}

// Get invader status via API
export async function getInvaderStatus(fid: number, invaderId: string): Promise<'want_to_find' | 'alive' | 'dead' | null> {
  const result = await getResource<{ status: 'want_to_find' | 'alive' | 'dead' | null }>(
    '/api/wishlist',
    { fid, invaderId },
    'Failed to get invader status'
  );
  return result.status;
}


// Get wishlist stats via API
export async function getWishlistStats(fid: number): Promise<{
  totalWanted: number;
  totalFound: number;
  totalItems: number;
  completionRate: number;
}> {
  return getResource('/api/wishlist', { fid, stats: true }, 'Failed to get wishlist stats');
}
