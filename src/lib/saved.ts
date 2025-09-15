// Saved List Management - Client-side API for invaders you've found

export interface SavedItem {
  invader_id: string;
  invader_name: string;
  photo_url: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  added_date: string;
}

export interface SavedList {
  fid: number;
  items: SavedItem[];
  stats: {
    total: number;
    last_updated: string;
  };
}

// Get user's saved list
export async function getSavedList(fid: number): Promise<SavedList> {
  const response = await fetch(`/api/saved?fid=${fid}`);
  if (!response.ok) {
    throw new Error(`Failed to load saved list: ${response.status}`);
  }
  return await response.json();
}

// Mark invader as found (move from hunt to saved)
export async function markAsFound(fid: number, invaderId: string): Promise<SavedList> {
  const response = await fetch('/api/saved', {
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

// Remove invader from saved list  
export async function removeFromSaved(fid: number, invaderId: string): Promise<SavedList> {
  const response = await fetch('/api/saved', {
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
    throw new Error(`Failed to remove from saved list: ${response.status}`);
  }
  
  return await response.json();
}