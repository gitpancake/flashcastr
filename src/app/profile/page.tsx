"use client";

import { useState } from "react";
import { Loading } from "~/components/atom/Loading";
import PersonalProfile from "~/components/organism/PersonalProfile";
import Setup from "~/components/organism/Setup";
import { useFrame } from "~/components/providers/FrameProvider";
import { useGetUser } from "~/hooks/api.flashcastrs.app/useGetUser";
import { User } from "~/lib/api.flashcastr.app/users";

export default function ProfilePage() {
  const { context } = useFrame();
  const [showSetupFlow, setShowSetupFlow] = useState<boolean>(false);

  const farcasterFid = context?.user?.fid;

  const { data: appUserArray, isLoading: userLoading, refetch: refetchAppUser } = useGetUser(farcasterFid);

  if (userLoading) {
    return <Loading />;
  }

  const handleSetupComplete = () => {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    refetchAppUser();
    setShowSetupFlow(false);
  };

  const handleSkipSetup = () => {
    setShowSetupFlow(false);
  };

  // If showing setup flow, render Setup component
  if (showSetupFlow) {
    return <Setup onSetupComplete={handleSetupComplete} onSkip={handleSkipSetup} />;
  }

  // If no Farcaster context, show sign-in prompt
  if (!context?.user) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen bg-black text-white p-4 font-mono">
        <div className="text-center max-w-md">
          <h1 className="text-green-400 text-2xl mb-4">PROFILE ACCESS</h1>
          <p className="text-gray-300 mb-4">Sign in with Farcaster to view your profile and link your Flash Invaders account.</p>
          <div className="text-gray-500 text-sm">
            <p>Please sign in through your Farcaster client (like Warpcast)</p>
          </div>
        </div>
      </div>
    );
  }

  const appUser = appUserArray && appUserArray.length > 0 ? appUserArray[0] : undefined;

  // If user has Farcaster context but no Flash Invaders account, show setup option
  if (!appUser) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen bg-black text-white p-4 font-mono">
        <div className="text-center max-w-md">
          <h1 className="text-green-400 text-2xl mb-4">LINK FLASH INVADERS</h1>
          <p className="text-gray-300 mb-6">Connect your Flash Invaders account to see your full profile with stats and enable auto-casting.</p>
          <button onClick={() => setShowSetupFlow(true)} className="bg-green-400 text-black px-6 py-3 font-bold hover:bg-green-300 transition-colors mb-4">
            LINK ACCOUNT
          </button>
          <div className="text-gray-500 text-sm">
            <p>Or view basic profile without linking</p>
          </div>
        </div>
      </div>
    );
  }

  return <PersonalProfile user={appUser} farcasterUserContext={context?.user} />;
}
