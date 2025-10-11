// Flash Links Management - Client-side API for linking flashes to map invaders

import { FlashResponse } from './api.flashcastr.app/flashes';

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
  const response = await fetch(`/api/flash-links?fid=${fid}`);
  if (!response.ok) {
    throw new Error(`Failed to load flash links: ${response.status}`);
  }
  return await response.json();
}

// Get links for a specific invader
export async function getInvaderLinks(fid: number, invaderId: string): Promise<{ links: FlashLink[] }> {
  const response = await fetch(`/api/flash-links?fid=${fid}&invader_id=${invaderId}`);
  if (!response.ok) {
    throw new Error(`Failed to load invader links: ${response.status}`);
  }
  return await response.json();
}

// Get link count for an invader
export async function getInvaderLinkCount(fid: number, invaderId: string): Promise<number> {
  const response = await fetch(`/api/flash-links?fid=${fid}&invader_id=${invaderId}&action=count`);
  if (!response.ok) {
    throw new Error(`Failed to load invader link count: ${response.status}`);
  }
  const data = await response.json();
  return data.count;
}

// Get link for a specific flash
export async function getFlashLink(fid: number, flashId: number): Promise<FlashLink | null> {
  const response = await fetch(`/api/flash-links?fid=${fid}&flash_id=${flashId}`);
  if (!response.ok) {
    throw new Error(`Failed to load flash link: ${response.status}`);
  }
  const data = await response.json();
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
  const response = await fetch('/api/flash-links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fid,
      action: 'link',
      flash_id: flashId,
      invader,
      city
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to link flash to invader: ${response.status}`);
  }

  return await response.json();
}

// Unlink flash from invader
export async function unlinkFlash(fid: number, flashId: number): Promise<UserFlashLinks> {
  const response = await fetch('/api/flash-links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fid,
      action: 'unlink',
      flash_id: flashId
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to unlink flash: ${response.status}`);
  }

  return await response.json();
}

// Get linkable flashes (user's flashes filtered by city)
export async function getLinkableFlashes(
  fid: number,
  city?: string
): Promise<FlashWithLinkInfo[]> {
  const response = await fetch('/api/flash-links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fid,
      action: 'get_linkable_flashes',
      city
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to load linkable flashes: ${response.status}`);
  }

  const data = await response.json();
  return data.flashes;
}
