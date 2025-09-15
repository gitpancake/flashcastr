// Invader Hunt Wishlist Management
// Stores user's wishlist against their Farcaster ID

export interface WishlistItem {
  invader_id: string; // e.g., "TK_132"
  invader_name: string; // e.g., "TK_132"  
  photo_url: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  added_date: string; // ISO date string
  status: 'want_to_find' | 'found'; // Future: can expand to other statuses
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

// LocalStorage key pattern
const WISHLIST_KEY = (fid: number) => `invader_wishlist_${fid}`;

// Get user's wishlist from localStorage (will migrate to Redis API later)
export function getWishlist(fid: number): UserWishlist {
  if (typeof window === 'undefined') return getEmptyWishlist(fid);
  
  try {
    const stored = localStorage.getItem(WISHLIST_KEY(fid));
    if (!stored) return getEmptyWishlist(fid);
    
    const parsed = JSON.parse(stored) as UserWishlist;
    return parsed;
  } catch (error) {
    console.error('Error loading wishlist:', error);
    return getEmptyWishlist(fid);
  }
}

// Save user's wishlist to localStorage
export function saveWishlist(wishlist: UserWishlist): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Update stats
    wishlist.stats = {
      total_wanted: wishlist.items.filter(item => item.status === 'want_to_find').length,
      total_found: wishlist.items.filter(item => item.status === 'found').length,
      last_updated: new Date().toISOString()
    };
    
    localStorage.setItem(WISHLIST_KEY(wishlist.fid), JSON.stringify(wishlist));
  } catch (error) {
    console.error('Error saving wishlist:', error);
  }
}

// Add invader to wishlist
export function addToWishlist(
  fid: number, 
  invader: { 
    i: number; 
    n: string; 
    l: { lat: number; lng: number }; 
    t: string; 
  }
): UserWishlist {
  const wishlist = getWishlist(fid);
  
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
  
  saveWishlist(wishlist);
  return wishlist;
}

// Remove invader from wishlist
export function removeFromWishlist(fid: number, invaderId: string): UserWishlist {
  const wishlist = getWishlist(fid);
  wishlist.items = wishlist.items.filter(item => item.invader_id !== invaderId);
  saveWishlist(wishlist);
  return wishlist;
}

// Mark invader as found
export function markAsFound(fid: number, invaderId: string): UserWishlist {
  const wishlist = getWishlist(fid);
  const item = wishlist.items.find(item => item.invader_id === invaderId);
  
  if (item) {
    item.status = 'found';
  }
  
  saveWishlist(wishlist);
  return wishlist;
}

// Check if invader is in wishlist
export function isInWishlist(fid: number, invaderId: string): boolean {
  const wishlist = getWishlist(fid);
  return wishlist.items.some(item => item.invader_id === invaderId);
}

// Get invader status
export function getInvaderStatus(fid: number, invaderId: string): 'want_to_find' | 'found' | null {
  const wishlist = getWishlist(fid);
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

// Get wishlist stats for display
export function getWishlistStats(fid: number) {
  const wishlist = getWishlist(fid);
  return {
    totalWanted: wishlist.stats.total_wanted,
    totalFound: wishlist.stats.total_found,
    totalItems: wishlist.items.length,
    completionRate: wishlist.stats.total_wanted > 0 
      ? Math.round((wishlist.stats.total_found / (wishlist.stats.total_wanted + wishlist.stats.total_found)) * 100)
      : 0
  };
}