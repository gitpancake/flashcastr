import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { User } from "~/lib/mongodb/users/types";

export const useUpdateAppUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: User) => {
      const response = await axios.delete(`/api/user`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
