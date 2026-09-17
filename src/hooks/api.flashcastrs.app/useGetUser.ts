import { useQuery } from "@tanstack/react-query";
import { usersApi } from "~/lib/api.flashcastr.app/users";

export function useGetUser(fid?: number) {
  return useQuery({
    queryKey: ["user", fid],
    queryFn: () => usersApi.getUser(fid),
    enabled: !!fid,
  });
}
