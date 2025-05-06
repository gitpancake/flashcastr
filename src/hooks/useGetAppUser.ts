import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User } from "~/lib/mongodb/users/types";

export const useGetAppUser = () => {
  return useQuery({
    queryFn: async () => {
      const response = await axios.get<User>(`/api/user`);

      if (response.status === 200) {
        return response.data;
      }

      return null;
    },
    queryKey: ["user"],
  });
};
