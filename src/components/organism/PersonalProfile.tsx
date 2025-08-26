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
    <div className="w-full min-h-screen bg-black">
      {/* Profile Header */}
      <ProfileSettings 
        user={user} 
        farcasterUserContext={farcasterUserContext} 
        flashCount={stats?.flashCount} 
        cities={stats?.cities?.length || 0} 
      />
      
      {/* User Feed */}
      {flashes && Array.isArray(flashes) && flashes.length > 0 && fidToUse && (
        <Feed initialFlashes={flashes} fid={fidToUse} />
      )}
      
      {/* No flashes message */}
      {(!flashes || !Array.isArray(flashes) || flashes.length === 0) && (
        <div className="w-full max-w-4xl mx-auto p-2 sm:p-6 font-mono">
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">NO FLASHES FOUND</div>
            <div className="text-gray-500 text-sm mt-2">
              {!user ? "Link your Flash Invaders account to see your flashes and enable auto-casting." : "No flashes available for this user."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
