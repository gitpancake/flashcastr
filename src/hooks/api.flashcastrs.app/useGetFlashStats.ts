import { useQuery } from "@tanstack/react-query";
import { FlashesApi } from "~/lib/api.flashcastr.app/flashes";

export function useGetFlashStats(fid?: number) {
  return useQuery({
    queryKey: ["flashStats", fid],
    queryFn: () => new FlashesApi().getFlashStats(fid),
    enabled: !!fid,
  });
}
