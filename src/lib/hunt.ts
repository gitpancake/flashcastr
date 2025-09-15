// Hunt List Management - Client-side API for invaders you want to find

export interface HuntItem {
  invader_id: string;
  invader_name: string;
  photo_url: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  added_date: string;
}

export interface HuntList {
  fid: number;
  items: HuntItem[];
  stats: {
    total: number;
    last_updated: string;
  };
}

// Get user's hunt list
export async function getHuntList(fid: number): Promise<HuntList> {
  const response = await fetch(`/api/hunt?fid=${fid}`);
  if (!response.ok) {
    throw new Error(`Failed to load hunt list: ${response.status}`);
  }
  return await response.json();
}

// Add invader to hunt list
export async function addToHunt(
  fid: number, 
  invader: { 
    i: number; 
    n: string; 
    l: { lat: number; lng: number }; 
    t: string; 
  }
): Promise<HuntList> {
  const response = await fetch('/api/hunt', {
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
    throw new Error(`Failed to add to hunt list: ${response.status}`);
  }
  
  return await response.json();
}

// Remove invader from hunt list
export async function removeFromHunt(fid: number, invaderId: string): Promise<HuntList> {
  const response = await fetch('/api/hunt', {
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
    throw new Error(`Failed to remove from hunt list: ${response.status}`);
  }
  
  return await response.json();
}