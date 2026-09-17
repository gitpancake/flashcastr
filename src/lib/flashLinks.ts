// Flash Links Management - Client-side API for linking flashes to map invaders

import { FlashResponse } from './api.flashcastr.app/flashes';
import { getResource, postResource } from './resourceClient';

export interface FlashLink {
  flash_id: number;
  invader_id: string;
  invader_name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  linked_date: string;
  city: string;
}

export interface UserFlashLinks {
  fid: number;
  links: FlashLink[];
  stats: {
    total_links: number;
    last_updated: string;
  };
}

export interface FlashWithLinkInfo extends FlashResponse {
  linked_to: FlashLink | null;
}

// Get user's flash links
export async function getFlashLinks(fid: number): Promise<UserFlashLinks> {
  return getResource<UserFlashLinks>('/api/flash-links', { fid }, 'Failed to load flash links');
}

// Get links for a specific invader
export async function getInvaderLinks(fid: number, invaderId: string): Promise<{ links: FlashLink[] }> {
  return getResource<{ links: FlashLink[] }>(
    '/api/flash-links',
    { fid, invader_id: invaderId },
    'Failed to load invader links'
  );
}

// Get link count for an invader
export async function getInvaderLinkCount(fid: number, invaderId: string): Promise<number> {
  const data = await getResource<{ count: number }>(
    '/api/flash-links',
    { fid, invader_id: invaderId, action: 'count' },
    'Failed to load invader link count'
  );
  return data.count;
}

// Get link for a specific flash
export async function getFlashLink(fid: number, flashId: number): Promise<FlashLink | null> {
  const data = await getResource<{ link: FlashLink | null }>(
    '/api/flash-links',
    { fid, flash_id: flashId },
    'Failed to load flash link'
  );
  return data.link;
}

// Link flash to invader
export async function linkFlashToInvader(
  fid: number,
  flashId: number,
  invader: {
    i: number;
    n: string;
    l: { lat: number; lng: number };
    t: string;
  },
  city: string
): Promise<UserFlashLinks> {
  return postResource<UserFlashLinks>(
    '/api/flash-links',
    { fid, action: 'link', flash_id: flashId, invader, city },
    'Failed to link flash to invader'
  );
}

// Unlink flash from invader
export async function unlinkFlash(fid: number, flashId: number): Promise<UserFlashLinks> {
  return postResource<UserFlashLinks>(
    '/api/flash-links',
    { fid, action: 'unlink', flash_id: flashId },
    'Failed to unlink flash'
  );
}

// Get linkable flashes (user's flashes filtered by city)
export async function getLinkableFlashes(
  fid: number,
  city?: string
): Promise<FlashWithLinkInfo[]> {
  const data = await postResource<{ flashes: FlashWithLinkInfo[] }>(
    '/api/flash-links',
    { fid, action: 'get_linkable_flashes', city },
    'Failed to load linkable flashes'
  );
  return data.flashes;
}
