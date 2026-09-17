import { useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { PollSignupStatusResponse, User, usersApi } from "~/lib/api.flashcastr.app/users";
import { LOCAL_STORAGE_KEYS } from "~/lib/constants";

const POLLING_INTERVAL = 2000; // 2 seconds
const POLLING_TIMEOUT = 300000; // 5 minutes

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

  const failPolling = useCallback(
    (message: string, fid?: number | null) => {
      onError(message, fid);
      toast.error(message);
      stopPolling();
    },
    [onError, stopPolling]
  );

  // Extracted Handlers
  const handleApprovedFinalized = useCallback(
    (response: PollSignupStatusResponse) => {
      if (response.user?.fid) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.FARCASTER_FID, response.user.fid.toString());
      }
      if (response.user) {
        onSuccess(response.user);
        stopPolling();
      } else {
        failPolling(response.message || "Signup approved but user data is missing.", response.fid);
      }
    },
    [onSuccess, stopPolling, failPolling]
  );

  const handlePollingException = useCallback(
    (error: unknown) => {
      console.error("Error during polling signup status:", error);
      let errorMessage = "Failed to poll signup status. Check console for details.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      failPolling(errorMessage); // Assuming onError doesn't always need fid for exceptions
    },
    [failPolling]
  );

  const handleUnknownStatus = useCallback(
    (response: PollSignupStatusResponse) => {
      console.warn(`Unknown polling status: ${response.status}, message: ${response.message}`);
      if (response.status?.toUpperCase().includes("ERROR")) {
        failPolling(response.message || `An unknown error occurred: ${response.status}`, response.fid);
      }
      // If not an explicit error, it continues polling by not calling stopPolling()
    },
    [failPolling]
  );

  useEffect(() => {
    if (!enabled || !signerUuid || !username) {
      stopPolling(); // Ensure polling stops if disabled or missing params
      return;
    }

    const STATUS_HANDLERS: Record<string, (response: PollSignupStatusResponse) => void> = {
      APPROVED_FINALIZED: handleApprovedFinalized,
      PENDING_APPROVAL: () => {},
      REVOKED: (response) => failPolling(response.message || "Signer request was revoked.", response.fid),
      ERROR_NEYNAR_LOOKUP: (response) =>
        failPolling(response.message || "An error occurred during Neynar lookup.", response.fid),
      ERROR_FINALIZATION: (response) =>
        failPolling(response.message || "An error occurred during signup finalization.", response.fid),
    };

    const poll = async () => {
      try {
        const response = await usersApi.pollSignupStatus(signerUuid, username);
        (STATUS_HANDLERS[response.status] ?? handleUnknownStatus)(response);
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
  }, [signerUuid, username, onError, stopPolling, enabled, failPolling, handleApprovedFinalized, handleUnknownStatus, handlePollingException]);

  // No return value needed from the hook itself, side effects are managed via callbacks
};
