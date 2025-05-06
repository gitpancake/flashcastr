import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useDeleteAppUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await axios.delete(`/api/user`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
