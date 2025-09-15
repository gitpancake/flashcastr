import { useState, useEffect, useCallback } from 'react';
import { getHuntList, addToHunt, removeFromHunt, HuntList } from '~/lib/hunt';
import { getSavedList, markAsFound, removeFromSaved, SavedList } from '~/lib/saved';

export type InvaderStatus = 'hunt' | 'saved' | null;

interface MapDataState {
  huntList: HuntList | null;
  savedList: SavedList | null;
  loading: boolean;
  error: boolean;
  statusMap: Record<string, InvaderStatus>;
}

export function useMapData(fid: number | undefined) {
  const [state, setState] = useState<MapDataState>({
    huntList: null,
    savedList: null,
    loading: false,
    error: false,
    statusMap: {},
  });

  // Load initial data once
  const loadInitialData = useCallback(async () => {
    if (!fid) return;

    setState(prev => ({ ...prev, loading: true, error: false }));
    
    try {
      console.log(`[DEBUG] Loading map data for FID ${fid}`);
      
      const [huntList, savedList] = await Promise.all([
        getHuntList(fid),
        getSavedList(fid)
      ]);

      // Create status map
      const statusMap: Record<string, InvaderStatus> = {};
      huntList.items.forEach(item => {
        statusMap[item.invader_id] = 'hunt';
      });
      savedList.items.forEach(item => {
        statusMap[item.invader_id] = 'saved';
      });

      setState({
        huntList,
        savedList,
        loading: false,
        error: false,
        statusMap,
      });

      console.log(`[DEBUG] Loaded ${huntList.items.length} hunt items, ${savedList.items.length} saved items`);
    } catch (error) {
      console.error('Error loading map data:', error);
      setState(prev => ({ ...prev, loading: false, error: true }));
    }
  }, [fid]);

  // Load data on mount and when fid changes
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Add to hunt list
  const addToHuntList = useCallback(async (invader: { 
    i: number; 
    n: string; 
    l: { lat: number; lng: number }; 
    t: string; 
  }) => {
    if (!fid) throw new Error('FID required');

    try {
      console.log(`[DEBUG] Adding ${invader.n} to hunt list`);
      const updatedHuntList = await addToHunt(fid, invader);
      
      setState(prev => ({
        ...prev,
        huntList: updatedHuntList,
        statusMap: {
          ...prev.statusMap,
          [invader.n]: 'hunt'
        }
      }));
      
      return updatedHuntList;
    } catch (error) {
      console.error('Error adding to hunt list:', error);
      throw error;
    }
  }, [fid]);

  // Remove from hunt list
  const removeFromHuntList = useCallback(async (invaderId: string) => {
    if (!fid) throw new Error('FID required');

    try {
      console.log(`[DEBUG] Removing ${invaderId} from hunt list`);
      const updatedHuntList = await removeFromHunt(fid, invaderId);
      
      setState(prev => {
        const newStatusMap = { ...prev.statusMap };
        delete newStatusMap[invaderId];
        
        return {
          ...prev,
          huntList: updatedHuntList,
          statusMap: newStatusMap
        };
      });
      
      return updatedHuntList;
    } catch (error) {
      console.error('Error removing from hunt list:', error);
      throw error;
    }
  }, [fid]);

  // Mark as found (move from hunt to saved)
  const markInvaderAsFound = useCallback(async (invaderId: string) => {
    if (!fid) throw new Error('FID required');

    try {
      console.log(`[DEBUG] Marking ${invaderId} as found`);
      const updatedSavedList = await markAsFound(fid, invaderId);
      
      // Also update hunt list by removing the item
      const updatedHuntList = state.huntList ? {
        ...state.huntList,
        items: state.huntList.items.filter(item => item.invader_id !== invaderId),
        stats: {
          ...state.huntList.stats,
          total: state.huntList.items.filter(item => item.invader_id !== invaderId).length
        }
      } : null;
      
      setState(prev => ({
        ...prev,
        huntList: updatedHuntList,
        savedList: updatedSavedList,
        statusMap: {
          ...prev.statusMap,
          [invaderId]: 'saved'
        }
      }));
      
      return updatedSavedList;
    } catch (error) {
      console.error('Error marking as found:', error);
      throw error;
    }
  }, [fid, state.huntList]);

  // Remove from saved list
  const removeFromSavedList = useCallback(async (invaderId: string) => {
    if (!fid) throw new Error('FID required');

    try {
      console.log(`[DEBUG] Removing ${invaderId} from saved list`);
      const updatedSavedList = await removeFromSaved(fid, invaderId);
      
      setState(prev => {
        const newStatusMap = { ...prev.statusMap };
        delete newStatusMap[invaderId];
        
        return {
          ...prev,
          savedList: updatedSavedList,
          statusMap: newStatusMap
        };
      });
      
      return updatedSavedList;
    } catch (error) {
      console.error('Error removing from saved list:', error);
      throw error;
    }
  }, [fid]);

  return {
    ...state,
    addToHuntList,
    removeFromHuntList,
    markInvaderAsFound,
    removeFromSavedList,
    refresh: loadInitialData,
  };
}