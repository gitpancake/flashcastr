import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useGetNeynarUser = ({ fid }: { fid?: number }) => {
  return useQuery({
    queryFn: async () => {
      const response = await axios.get(`/api/neynar/user?fid=${fid}`);

      if (response.status === 200) {
        return response.data;
      }

      return null;
    },
    queryKey: ["neynarUser", fid],
    enabled: !!fid,
  });
};
