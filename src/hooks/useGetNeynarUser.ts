import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useGetNeynarUser = ({ enabled }: { enabled?: boolean }) => {
  return useQuery({
    queryFn: async () => {
      const response = await axios.get(`/api/neynar/user`);

      if (response.status === 200) {
        return response.data;
      }

      return null;
    },
    queryKey: ["neynarUser"],
    enabled,
  });
};
