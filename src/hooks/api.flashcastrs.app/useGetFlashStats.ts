import { useQuery } from "@tanstack/react-query";
import { flashesApi } from "~/lib/api.flashcastr.app/flashes";

export function useGetFlashStats(fid?: number) {
  return useQuery({
    queryKey: ["flashStats", fid],
    queryFn: async () => {
      try {
        const stats = await flashesApi.getFlashStats(fid);
        return {
          flashCount: stats?.flashCount || 0,
          cities: stats?.cities || []
        };
      } catch (error) {
        console.error('Error fetching flash stats:', error);
        return {
          flashCount: 0,
          cities: []
        };
      }
    },
    enabled: !!fid,
  });
}
