import { useState, useEffect } from 'react';
import { FEATURES } from '~/lib/constants';

// Custom hook to check experimental access
export function useExperimentalAccess(fid: number | undefined) {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!fid) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      // Admin always has access
      if (fid === FEATURES.ADMIN_FID) {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      try {
        // Check if user is experimental via API
        const response = await fetch(`/api/user/experimental-status?fid=${fid}`);
        const data = await response.json();
        setHasAccess(data.hasAccess || false);
      } catch (error) {
        console.error('Error checking experimental access:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [fid]);

  return { hasAccess, isLoading };
}