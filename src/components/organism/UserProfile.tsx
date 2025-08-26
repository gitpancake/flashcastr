"use client";

import Image from "next/image";
import { useGetFidFlashes } from "~/hooks/api.flashcastrs.app/useGetFidFlashes";
import { useGetFlashStats } from "~/hooks/api.flashcastrs.app/useGetFlashStats";
import { useGetNeynarUser } from "~/hooks/useGetNeynarUser";
import { User } from "~/lib/api.flashcastr.app/users";
import { Loading } from "../atom/Loading";
import Feed from "../molecule/Feed";

export default function UserProfile({ user }: { user?: User }) {
  const { data: neynarUser, isLoading: neynarUserLoading } = useGetNeynarUser({ fid: user?.fid });
  const { data: stats, isLoading: statsLoading } = useGetFlashStats(user?.fid);
  const { data: flashes, isLoading: flashesLoading } = useGetFidFlashes(user?.fid);

  if (statsLoading || flashesLoading || neynarUserLoading) {
    return <Loading />;
  }

  if (!neynarUser) {
    return (
      <div className="flex flex-col justify-center w-full h-full bg-black">
        <p className="text-white font-invader text-center text-[32px] tracking-widest">User not found</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-black">
      {/* Profile Header - Consistent with ProfileSettings */}
      <div className="w-full max-w-4xl mx-auto p-2 sm:p-6 font-mono">
        <div className="text-center mb-4 sm:mb-8">
          <pre className="text-green-400 text-[6px] sm:text-xs leading-none hidden sm:block">
            {`
██████╗ ██████╗  ██████╗ ███████╗██╗██╗     ███████╗
██╔══██╗██╔══██╗██╔═══██╗██╔════╝██║██║     ██╔════╝
██████╔╝██████╔╝██║   ██║█████╗  ██║██║     █████╗  
██╔═══╝ ██╔══██╗██║   ██║██╔══╝  ██║██║     ██╔══╝  
██║     ██║  ██║╚██████╔╝██║     ██║███████╗███████╗
╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝╚══════╝
`}
          </pre>
          <div className="text-green-400 text-lg sm:hidden font-mono font-bold">PROFILE</div>
          <div className="text-gray-400 text-[10px] sm:text-sm mt-2">SPACE INVADER FLASH COMMANDER</div>
        </div>

        {/* Profile Info Card */}
        <div className="bg-gray-900 border border-green-400 p-3 sm:p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="relative">
              <Image 
                src={neynarUser.pfp_url ?? `/splash.png`} 
                width={64} 
                height={64} 
                alt="Profile" 
                className="rounded-full border-2 border-gray-600" 
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <h1 className="text-green-400 text-lg sm:text-xl font-bold">@{neynarUser.username}</h1>
              </div>
              
              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="text-center">
                    <span className="text-white font-bold text-sm sm:text-lg block">
                      {stats.flashCount || 0}
                    </span>
                    <div className="text-gray-400">FLASHES</div>
                  </div>
                  <div className="text-center">
                    <span className="text-cyan-400 font-bold text-sm sm:text-lg block">
                      {stats.cities?.length || 0}
                    </span>
                    <div className="text-gray-400">CITIES</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* User Feed */}
      {flashes && Array.isArray(flashes) && flashes.length > 0 && (
        <Feed initialFlashes={flashes} fid={user?.fid} />
      )}
      
      {/* No flashes message */}
      {(!flashes || !Array.isArray(flashes) || flashes.length === 0) && (
        <div className="w-full max-w-4xl mx-auto p-2 sm:p-6 font-mono">
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">NO FLASHES FOUND</div>
            <div className="text-gray-500 text-sm mt-2">No flashes available for this user.</div>
          </div>
        </div>
      )}
    </div>
  );
}
