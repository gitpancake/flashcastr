import { useState, useEffect, useCallback } from 'react';
import {
  getFlashLinks,
  linkFlashToInvader,
  unlinkFlash,
  getInvaderLinkCount,
  getLinkableFlashes,
  FlashLink,
  UserFlashLinks,
  FlashWithLinkInfo,
} from '~/lib/flashLinks';

interface UseFlashLinksState {
  links: FlashLink[];
  loading: boolean;
  error: boolean;
  linkMap: Map<number, FlashLink>; // flash_id -> FlashLink
  invaderLinkCounts: Map<string, number>; // invader_id -> count
}

export function useFlashLinks(fid: number | undefined) {
  const [state, setState] = useState<UseFlashLinksState>({
    links: [],
    loading: false,
    error: false,
    linkMap: new Map(),
    invaderLinkCounts: new Map(),
  });

  // Load initial links
  const loadLinks = useCallback(async () => {
    if (!fid) return;

    setState(prev => ({ ...prev, loading: true, error: false }));

    try {
      const userLinks = await getFlashLinks(fid);
      const linkMap = new Map(userLinks.links.map(link => [link.flash_id, link]));

      // Count links per invader
      const invaderLinkCounts = new Map<string, number>();
      userLinks.links.forEach(link => {
        const currentCount = invaderLinkCounts.get(link.invader_id) || 0;
        invaderLinkCounts.set(link.invader_id, currentCount + 1);
      });

      setState({
        links: userLinks.links,
        loading: false,
        error: false,
        linkMap,
        invaderLinkCounts,
      });
    } catch (error) {
      console.error('Error loading flash links:', error);
      setState(prev => ({ ...prev, loading: false, error: true }));
    }
  }, [fid]);

  // Load links on mount and when fid changes
  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  // Link a flash to an invader
  const linkFlash = useCallback(
    async (
      flashId: number,
      invader: {
        i: number;
        n: string;
        l: { lat: number; lng: number };
        t: string;
      },
      city: string
    ) => {
      if (!fid) throw new Error('FID required');

      try {
        const updatedLinks = await linkFlashToInvader(fid, flashId, invader, city);
        const linkMap = new Map(updatedLinks.links.map(link => [link.flash_id, link]));

        // Update invader link counts
        const invaderLinkCounts = new Map<string, number>();
        updatedLinks.links.forEach(link => {
          const currentCount = invaderLinkCounts.get(link.invader_id) || 0;
          invaderLinkCounts.set(link.invader_id, currentCount + 1);
        });

        setState({
          links: updatedLinks.links,
          loading: false,
          error: false,
          linkMap,
          invaderLinkCounts,
        });

        return updatedLinks;
      } catch (error) {
        console.error('Error linking flash:', error);
        throw error;
      }
    },
    [fid]
  );

  // Unlink a flash
  const unlinkFlashById = useCallback(
    async (flashId: number) => {
      if (!fid) throw new Error('FID required');

      try {
        const updatedLinks = await unlinkFlash(fid, flashId);
        const linkMap = new Map(updatedLinks.links.map(link => [link.flash_id, link]));

        // Update invader link counts
        const invaderLinkCounts = new Map<string, number>();
        updatedLinks.links.forEach(link => {
          const currentCount = invaderLinkCounts.get(link.invader_id) || 0;
          invaderLinkCounts.set(link.invader_id, currentCount + 1);
        });

        setState({
          links: updatedLinks.links,
          loading: false,
          error: false,
          linkMap,
          invaderLinkCounts,
        });

        return updatedLinks;
      } catch (error) {
        console.error('Error unlinking flash:', error);
        throw error;
      }
    },
    [fid]
  );

  // Get linkable flashes for a city
  const fetchLinkableFlashes = useCallback(
    async (city?: string): Promise<FlashWithLinkInfo[]> => {
      if (!fid) throw new Error('FID required');

      try {
        const flashes = await getLinkableFlashes(fid, city);
        return flashes;
      } catch (error) {
        console.error('Error fetching linkable flashes:', error);
        throw error;
      }
    },
    [fid]
  );

  // Get link for a specific flash
  const getFlashLinkInfo = useCallback(
    (flashId: number): FlashLink | undefined => {
      return state.linkMap.get(flashId);
    },
    [state.linkMap]
  );

  // Get link count for an invader
  const getInvaderLinkCountLocal = useCallback(
    (invaderId: string): number => {
      return state.invaderLinkCounts.get(invaderId) || 0;
    },
    [state.invaderLinkCounts]
  );

  // Check if flash is linked
  const isFlashLinked = useCallback(
    (flashId: number): boolean => {
      return state.linkMap.has(flashId);
    },
    [state.linkMap]
  );

  return {
    links: state.links,
    loading: state.loading,
    error: state.error,
    linkFlash,
    unlinkFlash: unlinkFlashById,
    fetchLinkableFlashes,
    getFlashLinkInfo,
    getInvaderLinkCount: getInvaderLinkCountLocal,
    isFlashLinked,
    refresh: loadLinks,
  };
}
