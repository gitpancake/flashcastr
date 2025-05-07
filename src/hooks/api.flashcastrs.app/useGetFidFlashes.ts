import { useQuery } from "@tanstack/react-query";
import { FlashesApi } from "~/lib/api.flashcastr.app/flashes";
import { FETCH } from "~/lib/constants";

export function useGetFidFlashes(fid?: number) {
  return useQuery({
    queryKey: ["flashes", fid],
    queryFn: () => new FlashesApi().getFlashes(FETCH.INITIAL_PAGE, FETCH.LIMIT, fid),
    enabled: !!fid,
  });
}
