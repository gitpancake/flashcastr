import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { queryKeys } from "~/lib/queryKeys";

export const useUpdateAppUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ auto_cast }: { auto_cast: boolean }) => {
      const response = await axios.put(`/api/user`, {
        auto_cast,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user() });
    },
  });
};
