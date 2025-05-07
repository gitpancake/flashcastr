import { useQuery } from "@tanstack/react-query";
import { UsersApi } from "~/lib/api.flashcastr.app/users";

export function useGetUser(fid?: number) {
  return useQuery({
    queryKey: ["user", fid],
    queryFn: () => new UsersApi().getUser(fid),
    enabled: !!fid,
  });
}
