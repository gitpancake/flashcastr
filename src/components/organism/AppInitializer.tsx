"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loading } from "~/components/atom/Loading";
import Feed from "~/components/molecule/Feed";
import { useFrame } from "~/components/providers/FrameProvider";
import { useGetUser } from "~/hooks/api.flashcastrs.app/useGetUser";
import { FlashResponse } from "~/lib/api.flashcastr.app/flashes";
import Setup from "./Setup";

const SETUP_SKIPPED_STORAGE_KEY = "flashcastr_setup_skipped";

interface AppInitializerProps {
  initialFlashes: FlashResponse[];
}

export default function AppInitializer({ initialFlashes }: AppInitializerProps) {
  const { context } = useFrame();
  const farcasterFid = context?.user?.fid;

  const { data: appUserArray, isLoading: userLoading, refetch: refetchAppUser } = useGetUser(farcasterFid);
  const appUser = appUserArray && appUserArray.length > 0 ? appUserArray[0] : undefined;

  const [showSetupFlow, setShowSetupFlow] = useState<boolean | null>(null);
  const [hasSkippedSetup, setHasSkippedSetup] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(SETUP_SKIPPED_STORAGE_KEY) === "true";
    }
    return false;
  });

  useEffect(() => {
    if (!farcasterFid) {
      // Wait for FID to be available
      setShowSetupFlow(null); // Remain in undecided/loading state
      return;
    }
    if (userLoading) {
      // Still loading user data
      return;
    }

    if (!appUser && !hasSkippedSetup) {
      setShowSetupFlow(true);
    } else {
      setShowSetupFlow(false);
    }
  }, [userLoading, appUser, hasSkippedSetup, farcasterFid]);

  const handleSetupComplete = () => {
    refetchAppUser();
    setShowSetupFlow(false);
    setHasSkippedSetup(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem(SETUP_SKIPPED_STORAGE_KEY);
    }
  };

  const handleSkipSetup = () => {
    setHasSkippedSetup(true);
    setShowSetupFlow(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(SETUP_SKIPPED_STORAGE_KEY, "true");
    }
  };

  if (showSetupFlow === null || (!farcasterFid && showSetupFlow === null) || (farcasterFid && userLoading && !appUser && !hasSkippedSetup && showSetupFlow === null)) {
    return <Loading />;
  }

  if (showSetupFlow) {
    return <Setup onSetupComplete={handleSetupComplete} onSkip={handleSkipSetup} />;
  }

  return (
    <div className="flex flex-col w-full">
      {hasSkippedSetup && !appUser && (
        <div className="p-3 text-center text-gray-100 text-sm">
          <p>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setHasSkippedSetup(false);
                setShowSetupFlow(true);
                if (typeof window !== "undefined") localStorage.removeItem(SETUP_SKIPPED_STORAGE_KEY);
              }}
              className="font-semibold underline hover:text-gray-300"
            >
              Link your Flash Invaders account
            </Link>{" "}
            to auto-cast your flashes & see full stats.
          </p>
        </div>
      )}
      <Feed initialFlashes={initialFlashes} />
    </div>
  );
}
