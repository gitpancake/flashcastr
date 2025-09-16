// Access control utilities
import { FEATURES } from './constants';
import { isExperimentalUserRedis } from './redis';

// Check if user has experimental access (admin or experimental user)
export async function hasExperimentalAccess(fid: number | undefined): Promise<boolean> {
  if (!fid) return false;
  
  // Admin always has access
  if (fid === FEATURES.ADMIN_FID) {
    return true;
  }
  
  // Check if user is in experimental users list
  return await isExperimentalUserRedis(fid);
}

// Check if user is admin
export function isAdmin(fid: number | undefined): boolean {
  return fid === FEATURES.ADMIN_FID;
}