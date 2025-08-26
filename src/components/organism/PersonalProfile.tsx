"use client";

import { FrameContext } from "@farcaster/frame-core/dist/context";
import { useGetFidFlashes } from "~/hooks/api.flashcastrs.app/useGetFidFlashes";
import { useGetFlashStats } from "~/hooks/api.flashcastrs.app/useGetFlashStats";
import { User } from "~/lib/api.flashcastr.app/users";
import { Loading } from "../atom/Loading";
import Feed from "../molecule/Feed";
import { ProfileSettings } from "../molecule/ProfileSettings";

interface PersonalProfileProps {
  user?: User;
  farcasterUserContext?: FrameContext["user"];
}

export default function PersonalProfile({ user, farcasterUserContext }: PersonalProfileProps) {
  const fidToUse = user?.fid || farcasterUserContext?.fid;

  const { data: stats, isLoading: statsLoading, error: statsError } = useGetFlashStats(fidToUse);
  const { data: flashes, isLoading: flashesLoading, error: flashesError } = useGetFidFlashes(fidToUse);

  if (statsLoading || flashesLoading) {
    return <Loading />;
  }

  // Handle API errors gracefully
  if (statsError || flashesError) {
    console.error("Profile API errors:", { statsError, flashesError });
  }

  if (!fidToUse) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-full bg-black text-white p-4">
        <p>User Farcaster ID not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center w-full h-full bg-black">
      <div className="flex flex-col items-center gap-2 py-4">
        <ProfileSettings user={user} farcasterUserContext={farcasterUserContext} flashCount={stats?.flashCount} cities={stats?.cities?.length || 0} />
      </div>
      {flashes && fidToUse && <Feed initialFlashes={flashes} fid={fidToUse} />}
      {!user && (
        <div className="text-center text-yellow-400 p-4">
          <p>Link your Flash Invaders account to see more stats and enable auto-casting.</p>
        </div>
      )}
    </div>
  );
}
