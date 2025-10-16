import { useQuery } from "@tanstack/react-query";
import { FlashesApi } from "~/lib/api.flashcastr.app/flashes";

interface LeaderboardEntry {
  fid: number;
  username: string;
  pfp_url: string;
  flashCount: number;
  citiesCount: number;
}

export const useGetLeaderboard = () => {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const api = new FlashesApi();
      
      // Get unique users from recent flashes to build leaderboard
      // This is temporary until we have a proper leaderboard endpoint
      const recentFlashes = await api.getFlashes(1, 100);
      
      const userMap = new Map<number, LeaderboardEntry>();
      
      for (const flash of recentFlashes) {
        if (!userMap.has(flash.user_fid)) {
          userMap.set(flash.user_fid, {
            fid: flash.user_fid,
            username: flash.user_username,
            pfp_url: flash.user_pfp_url,
            flashCount: 0,
            citiesCount: 0
          });
        }
        
        const user = userMap.get(flash.user_fid)!;
        user.flashCount++;
      }
      
      // Get stats for each user in parallel
      const statsPromises = Array.from(userMap.entries()).map(async ([fid, user]) => {
        try {
          const stats = await api.getFlashStats(fid);
          user.flashCount = stats.flashCount;
          user.citiesCount = stats.cities.length;
        } catch (error) {
          console.error(`Failed to get stats for user ${fid}`, error);
        }
      });

      await Promise.all(statsPromises);
      
      // Convert map to array and sort by flash count
      return Array.from(userMap.values())
        .sort((a, b) => b.flashCount - a.flashCount)
        .slice(0, 50); // Top 50 users
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};