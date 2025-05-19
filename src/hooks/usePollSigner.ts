import { useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { PollSignupStatusResponse, User, UsersApi } from "~/lib/api.flashcastr.app/users";
import { LOCAL_STORAGE_KEYS } from "~/lib/constants";

const POLLING_INTERVAL = 2000; // 2 seconds
const POLLING_TIMEOUT = 300000; // 5 minutes

const usersApi = new UsersApi();

interface UsePollSignerProps {
  signerUuid: string | null | undefined;
  username: string | null | undefined;
  onSuccess: (user: User) => void;
  onError: (message: string, fid?: number | null) => void;
  onSettled?: () => void; // Called when polling stops for any reason (success, error, timeout)
  enabled?: boolean; // Control when polling should start
}

export const usePollSigner = ({
  signerUuid,
  username,
  onSuccess,
  onError,
  onSettled,
  enabled = true, // Default to true, polling starts if signerUuid and username are present
}: UsePollSignerProps) => {
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    onSettled?.();
  }, [onSettled]);

  // Extracted Handlers
  const handleApprovedFinalized = useCallback(
    (response: PollSignupStatusResponse) => {
      if (response.user?.fid) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.FARCASTER_FID, response.user.fid.toString());
      }
      if (response.user) {
        onSuccess(response.user);
        toast.success(response.message || "Signup successful!");
      } else {
        onError(response.message || "Signup approved but user data is missing.", response.fid);
        toast.error(response.message || "Signup approved but user data is missing.");
      }
      stopPolling();
    },
    [onSuccess, onError, stopPolling]
  );

  const handleRevoked = useCallback(
    (response: PollSignupStatusResponse) => {
      onError(response.message || "Signer request was revoked.", response.fid);
      toast.error(response.message || "Signer request was revoked.");
      stopPolling();
    },
    [onError, stopPolling]
  );

  const handleGenericError = useCallback(
    (response: PollSignupStatusResponse, defaultMessage: string) => {
      onError(response.message || defaultMessage, response.fid);
      toast.error(response.message || defaultMessage);
      stopPolling();
    },
    [onError, stopPolling]
  );

  const handlePollingException = useCallback(
    (error: unknown) => {
      console.error("Error during polling signup status:", error);
      let errorMessage = "Failed to poll signup status. Check console for details.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      onError(errorMessage); // Assuming onError doesn't always need fid for exceptions
      toast.error(errorMessage);
      stopPolling();
    },
    [onError, stopPolling]
  );

  const handleUnknownStatus = useCallback(
    (response: PollSignupStatusResponse) => {
      console.warn(`Unknown polling status: ${response.status}, message: ${response.message}`);
      if (response.status?.toUpperCase().includes("ERROR")) {
        onError(response.message || `An unknown error occurred: ${response.status}`, response.fid);
        toast.error(response.message || `An unknown error occurred: ${response.status}`);
        stopPolling();
      }
      // If not an explicit error, it continues polling by not calling stopPolling()
    },
    [onError, stopPolling]
  );

  useEffect(() => {
    if (!enabled || !signerUuid || !username) {
      stopPolling(); // Ensure polling stops if disabled or missing params
      return;
    }

    const poll = async () => {
      try {
        const response = await usersApi.pollSignupStatus(signerUuid, username);

        switch (response.status) {
          case "APPROVED_FINALIZED":
            handleApprovedFinalized(response);
            break;
          case "PENDING_APPROVAL":
            // Continue polling, do nothing here
            break;
          case "REVOKED":
            handleRevoked(response);
            break;
          case "ERROR_NEYNAR_LOOKUP":
            handleGenericError(response, "An error occurred during Neynar lookup.");
            break;
          case "ERROR_FINALIZATION":
            handleGenericError(response, "An error occurred during signup finalization.");
            break;
          default:
            handleUnknownStatus(response);
            break;
        }
      } catch (error: unknown) {
        handlePollingException(error);
      }
    };

    // Start polling immediately and then set an interval
    poll();
    intervalIdRef.current = setInterval(poll, POLLING_INTERVAL);

    // Set a timeout for the entire polling duration
    timeoutIdRef.current = setTimeout(() => {
      toast.error("Signup process timed out. Please try again.");
      onError("Signup process timed out after 5 minutes.");
      stopPolling();
    }, POLLING_TIMEOUT);

    // Cleanup function
    return () => {
      stopPolling();
    };
  }, [signerUuid, username, onSuccess, onError, stopPolling, enabled, handleApprovedFinalized, handleRevoked, handleGenericError, handlePollingException, handleUnknownStatus]); // Add `enabled` and new handlers to dependencies

  // No return value needed from the hook itself, side effects are managed via callbacks
};
