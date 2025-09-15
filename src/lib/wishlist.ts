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

// LocalStorage key pattern for fallback
const WISHLIST_KEY = (fid: number) => `invader_wishlist_${fid}`;

// Get user's wishlist from Redis via API with localStorage fallback
export async function getWishlist(fid: number): Promise<UserWishlist> {
  try {
    const response = await fetch(`/api/wishlist?fid=${fid}`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('API request failed');
    }
  } catch (error) {
    console.error('Error loading wishlist from API, falling back to localStorage:', error);
    
    // Fallback to localStorage
    if (typeof window === 'undefined') return getEmptyWishlist(fid);
    
    try {
      const stored = localStorage.getItem(WISHLIST_KEY(fid));
      if (!stored) return getEmptyWishlist(fid);
      
      const parsed = JSON.parse(stored) as UserWishlist;
      return parsed;
    } catch (localError) {
      console.error('Error loading wishlist from localStorage:', localError);
      return getEmptyWishlist(fid);
    }
  }
}

// Save user's wishlist to localStorage (fallback only)
function saveWishlistLocal(wishlist: UserWishlist): void {
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

// Add invader to wishlist via API with localStorage fallback
export async function addToWishlist(
  fid: number, 
  invader: { 
    i: number; 
    n: string; 
    l: { lat: number; lng: number }; 
    t: string; 
  }
): Promise<UserWishlist> {
  try {
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
    
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('API request failed');
    }
  } catch (error) {
    console.error('Error adding to wishlist via API, falling back to localStorage:', error);
    
    // Fallback to localStorage
    const wishlist = await getWishlist(fid);
    
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
    
    saveWishlistLocal(wishlist);
    return wishlist;
  }
}

// Remove invader from wishlist via API with localStorage fallback
export async function removeFromWishlist(fid: number, invaderId: string): Promise<UserWishlist> {
  try {
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
    
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('API request failed');
    }
  } catch (error) {
    console.error('Error removing from wishlist via API, falling back to localStorage:', error);
    
    // Fallback to localStorage
    const wishlist = await getWishlist(fid);
    wishlist.items = wishlist.items.filter(item => item.invader_id !== invaderId);
    saveWishlistLocal(wishlist);
    return wishlist;
  }
}

// Mark invader as found via API with localStorage fallback
export async function markAsFound(fid: number, invaderId: string): Promise<UserWishlist> {
  try {
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
    
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('API request failed');
    }
  } catch (error) {
    console.error('Error marking as found via API, falling back to localStorage:', error);
    
    // Fallback to localStorage
    const wishlist = await getWishlist(fid);
    const item = wishlist.items.find(item => item.invader_id === invaderId);
    
    if (item) {
      item.status = 'found';
    }
    
    saveWishlistLocal(wishlist);
    return wishlist;
  }
}

// Check if invader is in wishlist (legacy function, use getInvaderStatus instead)
export async function isInWishlist(fid: number, invaderId: string): Promise<boolean> {
  const status = await getInvaderStatus(fid, invaderId);
  return status !== null;
}

// Get invader status via API with localStorage fallback
export async function getInvaderStatus(fid: number, invaderId: string): Promise<'want_to_find' | 'found' | null> {
  try {
    const response = await fetch(`/api/wishlist?fid=${fid}&invaderId=${invaderId}`);
    if (response.ok) {
      const result = await response.json();
      return result.status;
    } else {
      throw new Error('API request failed');
    }
  } catch (error) {
    console.error('Error getting invader status via API, falling back to localStorage:', error);
    
    // Fallback to localStorage
    const wishlist = await getWishlist(fid);
    const item = wishlist.items.find(item => item.invader_id === invaderId);
    return item ? item.status : null;
  }
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

// Get wishlist stats via API with localStorage fallback
export async function getWishlistStats(fid: number): Promise<{
  totalWanted: number;
  totalFound: number;
  totalItems: number;
  completionRate: number;
}> {
  try {
    const response = await fetch(`/api/wishlist?fid=${fid}&stats=true`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('API request failed');
    }
  } catch (error) {
    console.error('Error getting wishlist stats via API, falling back to localStorage:', error);
    
    // Fallback to localStorage
    const wishlist = await getWishlist(fid);
    return {
      totalWanted: wishlist.stats.total_wanted,
      totalFound: wishlist.stats.total_found,
      totalItems: wishlist.items.length,
      completionRate: wishlist.stats.total_wanted > 0 
        ? Math.round((wishlist.stats.total_found / (wishlist.stats.total_wanted + wishlist.stats.total_found)) * 100)
        : 0
    };
  }
}