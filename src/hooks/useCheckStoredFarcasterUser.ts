import { useEffect } from "react";
import { LOCAL_STORAGE_KEYS } from "~/lib/constants";

type FarcasterUser = {
  signer_uuid: string;
  public_key: string;
  status: string;
  signer_approval_url?: string;
  fid?: number;
};

export const useCheckStoredFarcasterUser = (callback: (user: FarcasterUser) => void) => {
  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.FARCASTER_USER);

    if (storedData) {
      const user: FarcasterUser = JSON.parse(storedData);
      callback(user);
    }
  }, []);
};
