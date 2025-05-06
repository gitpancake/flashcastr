import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useSaveUser = (callback: (username: string) => void) => {
	return useMutation({
    mutationFn: async (username: string) => {
      const response = await axios.post<{
        fid: number;
        username: string;
      }>(`/api/user`, {
        username,
      });

      return response.data;
    },
    onSuccess: (data) => {
      callback(data.username);
    },
  });
}