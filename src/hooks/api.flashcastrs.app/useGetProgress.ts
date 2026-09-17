import { useQuery } from "@tanstack/react-query";
import { flashesApi, DailyProgress } from "~/lib/api.flashcastr.app/flashes";

export const useGetProgress = (fid: number | undefined, days: number = 7, order: 'ASC' | 'DESC' = 'ASC') => {
  return useQuery<DailyProgress[]>({
    queryKey: ["progress", fid, days, order],
    queryFn: async () => {
      if (!fid) return [];

      return await flashesApi.getProgress(fid, days, order);
    },
    enabled: !!fid, // Only run query if fid is provided
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};
