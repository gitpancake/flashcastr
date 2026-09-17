// Hunt List Management - Client-side API for invaders you want to find

import { getResource, postResource } from './resourceClient';

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
  return getResource<HuntList>('/api/hunt', { fid }, 'Failed to load hunt list');
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
  return postResource<HuntList>(
    '/api/hunt',
    { fid, action: 'add', invader },
    'Failed to add to hunt list'
  );
}

// Remove invader from hunt list
export async function removeFromHunt(fid: number, invaderId: string): Promise<HuntList> {
  return postResource<HuntList>(
    '/api/hunt',
    { fid, action: 'remove', invaderId },
    'Failed to remove from hunt list'
  );
}
