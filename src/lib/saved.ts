// Saved List Management - Client-side API for invaders you've found

import { getResource, postResource } from './resourceClient';

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
  return getResource<SavedList>('/api/saved', { fid }, 'Failed to load saved list');
}

// Mark invader as alive
export async function markAsAlive(fid: number, invaderId: string): Promise<SavedList> {
  return postResource<SavedList>(
    '/api/saved',
    { fid, action: 'mark_alive', invaderId },
    'Failed to mark as alive'
  );
}

// Mark invader as dead
export async function markAsDead(fid: number, invaderId: string): Promise<SavedList> {
  return postResource<SavedList>(
    '/api/saved',
    { fid, action: 'mark_dead', invaderId },
    'Failed to mark as dead'
  );
}

// Remove invader from saved list
export async function removeFromSaved(fid: number, invaderId: string): Promise<SavedList> {
  return postResource<SavedList>(
    '/api/saved',
    { fid, action: 'remove', invaderId },
    'Failed to remove from saved list'
  );
}
