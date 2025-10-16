import { useQuery } from "@tanstack/react-query";
import { FlashesApi, LeaderboardEntry as ApiLeaderboardEntry } from "~/lib/api.flashcastr.app/flashes";

interface LeaderboardEntry {
  username: string;
  pfp_url: string | null;
  flashCount: number;
  citiesCount: number;
}

export const useGetLeaderboard = (limit: number = 100) => {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", limit],
    queryFn: async () => {
      const api = new FlashesApi();
      const entries = await api.getLeaderboard(limit);

      // Map API response to our internal format
      return entries.map((entry: ApiLeaderboardEntry) => ({
        username: entry.username,
        pfp_url: entry.pfp_url,
        flashCount: entry.flash_count,
        citiesCount: entry.city_count,
      }));
    },
    staleTime: 1000 * 60 * 60, // 1 hour (matches server cache)
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  });
};