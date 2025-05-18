import { useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { User, UsersApi } from "~/lib/api.flashcastr.app/users";
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
            if (response.user?.fid) {
              localStorage.setItem(LOCAL_STORAGE_KEYS.FARCASTER_FID, response.user.fid.toString());
            }
            if (response.user) {
              onSuccess(response.user);
              toast.success(response.message || "Signup successful!");
            } else {
              // This case should ideally not happen if status is APPROVED_FINALIZED
              onError(response.message || "Signup approved but user data is missing.", response.fid);
              toast.error(response.message || "Signup approved but user data is missing.");
            }
            stopPolling();
            break;
          case "PENDING_APPROVAL":
            // Continue polling, do nothing here
            break;
          case "REVOKED":
            onError(response.message || "Signer request was revoked.", response.fid);
            toast.error(response.message || "Signer request was revoked.");
            stopPolling();
            break;
          case "ERROR_NEYNAR_LOOKUP":
          case "ERROR_FINALIZATION":
            onError(response.message || "An error occurred during signup.", response.fid);
            toast.error(response.message || "An error occurred during signup. Please try again.");
            stopPolling();
            break;
          default:
            // Handle other Neynar statuses or unexpected statuses
            console.warn(`Unknown polling status: ${response.status}, message: ${response.message}`);
            // Potentially treat as an error or continue polling based on product decision
            // For now, treating as a temporary issue and continuing to poll unless it's an explicit error status from backend.
            // If backend might send other terminal error statuses, they should be added here.
            if (response.status?.toUpperCase().includes("ERROR")) {
              onError(response.message || `An unknown error occurred: ${response.status}`, response.fid);
              toast.error(response.message || `An unknown error occurred: ${response.status}`);
              stopPolling();
            }
            break;
        }
      } catch (error: unknown) {
        console.error("Error during polling signup status:", error);
        // If the error is critical or API call consistently fails, stop polling
        // For a single failed attempt, we might want to retry a few times before stopping
        // but for now, we'll display an error and stop.
        let errorMessage = "Failed to poll signup status. Check console for details.";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        onError(errorMessage);
        toast.error(errorMessage);
        stopPolling();
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
  }, [signerUuid, username, onSuccess, onError, stopPolling, enabled]); // Add `enabled` to dependencies

  // No return value needed from the hook itself, side effects are managed via callbacks
};
