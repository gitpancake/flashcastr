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
    <div className="flex flex-col justify-center w-full h-full bg-black">
      <div className="flex flex-col items-center gap-2">
        <Image src={neynarUser.pfp_url ?? `/splash.png`} width={64} height={64} alt="Profile" />
        <p className="text-white font-invader text-[32px] tracking-widest my-[-10px]">{neynarUser.username}</p>
        {stats && (
          <>
            <p className="text-white font-invader text-[24px] tracking-widest my-[-10px]">
              {stats.flashCount} {stats.flashCount === 1 ? "Flash" : "Flashes"}
            </p>
            <p className="text-white font-invader text-[24px] tracking-widest my-[-10px]">
              {stats.cities.length} {stats.cities.length === 1 ? "City" : "Cities"}
            </p>
          </>
        )}
      </div>
      <div className="flex w-full justify-center">{flashes && <Feed initialFlashes={flashes} fid={user?.fid} />}</div>
    </div>
  );
}
