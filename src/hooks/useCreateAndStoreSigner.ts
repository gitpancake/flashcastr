import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { InitiateSignupResponse, UsersApi } from "~/lib/api.flashcastr.app/users"; // Adjusted import path

// Instantiate the UsersApi
const usersApi = new UsersApi();

export const useCreateSigner = (
  onSuccessCallback: (response: InitiateSignupResponse) => void
  // It's good practice to also allow an onError callback if the hook consumer needs to do more than just toast
  // onErrorCallback?: (error: Error) => void
): UseMutationResult<InitiateSignupResponse, Error, string, unknown> => {
  return useMutation<InitiateSignupResponse, Error, string, unknown>({
    mutationFn: async (username: string) => {
      // Use the new initiateSignup method from UsersApi
      return usersApi.initiateSignup(username);
    },
    onSuccess: (data) => {
      // data is already InitiateSignupResponse due to the direct return from usersApi.initiateSignup
      onSuccessCallback(data);
    },
    onError: (error) => {
      // Handle errors, e.g., log them or show a toast notification
      console.error("Error in useCreateSigner during initiateSignup:", error);
      // You might want to propagate the error or update UI state here
      // For example, by calling the callback with an error structure or a specific error state
      // callback({ error: error.message }); // If your callback is designed to handle errors
      toast.error(error.message || "Failed to initiate signup. Please try again.");
      // if (onErrorCallback) {
      //   onErrorCallback(error);
      // }
    },
  });
};
