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
  status: 'alive' | 'dead';
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

// Mark invader as alive
export async function markAsAlive(fid: number, invaderId: string): Promise<SavedList> {
  const response = await fetch('/api/saved', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fid,
      action: 'mark_alive',
      invaderId
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to mark as alive: ${response.status}`);
  }
  
  return await response.json();
}

// Mark invader as dead
export async function markAsDead(fid: number, invaderId: string): Promise<SavedList> {
  const response = await fetch('/api/saved', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fid,
      action: 'mark_dead',
      invaderId
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to mark as dead: ${response.status}`);
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