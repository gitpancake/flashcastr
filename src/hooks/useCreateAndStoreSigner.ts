import { Signer } from "@neynar/nodejs-sdk/build/api";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useCreateAndStoreSigner = (callback: (signer: Signer) => void) => {
  return useMutation({
    mutationFn: async () => {
      const response = await axios.post<Signer>(`/api/signer`);

      if (response.status === 200) {
        return response.data;
      }

      return null;
    },
    onSuccess: (data) => {
      if (!data) {
        return;
      }

      callback(data);
    },
  });
};
