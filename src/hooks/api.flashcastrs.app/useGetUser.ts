import { useQuery } from "@tanstack/react-query";
import { usersApi } from "~/lib/api.flashcastr.app/users";
import { queryKeys } from "~/lib/queryKeys";

export function useGetUser(fid?: number) {
  return useQuery({
    queryKey: queryKeys.user(fid),
    queryFn: () => usersApi.getUser(fid),
    enabled: !!fid,
  });
}
