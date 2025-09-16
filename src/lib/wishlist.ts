// Invader Hunt Wishlist Management
// Stores user's wishlist in Redis via API endpoints

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
  const response = await fetch(`/api/wishlist?fid=${fid}`);
  if (!response.ok) {
    throw new Error(`Failed to load wishlist: ${response.status}`);
  }
  return await response.json();
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
  const response = await fetch('/api/wishlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fid,
      action: 'add',
      invader
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to add to wishlist: ${response.status}`);
  }
  
  return await response.json();
}

// Remove invader from wishlist via API
export async function removeFromWishlist(fid: number, invaderId: string): Promise<UserWishlist> {
  const response = await fetch('/api/wishlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fid,
      action: 'remove',
      invaderId
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to remove from wishlist: ${response.status}`);
  }
  
  return await response.json();
}

// Mark invader as found via API
export async function markAsFound(fid: number, invaderId: string): Promise<UserWishlist> {
  const response = await fetch('/api/wishlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fid,
      action: 'mark_found',
      invaderId
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to mark as found: ${response.status}`);
  }
  
  return await response.json();
}

// Check if invader is in wishlist
export async function isInWishlist(fid: number, invaderId: string): Promise<boolean> {
  const status = await getInvaderStatus(fid, invaderId);
  return status !== null;
}

// Get invader status via API
export async function getInvaderStatus(fid: number, invaderId: string): Promise<'want_to_find' | 'alive' | 'dead' | null> {
  const response = await fetch(`/api/wishlist?fid=${fid}&invaderId=${invaderId}`);
  if (!response.ok) {
    throw new Error(`Failed to get invader status: ${response.status}`);
  }
  
  const result = await response.json();
  return result.status;
}


// Get wishlist stats via API
export async function getWishlistStats(fid: number): Promise<{
  totalWanted: number;
  totalFound: number;
  totalItems: number;
  completionRate: number;
}> {
  const response = await fetch(`/api/wishlist?fid=${fid}&stats=true`);
  if (!response.ok) {
    throw new Error(`Failed to get wishlist stats: ${response.status}`);
  }
  
  return await response.json();
}