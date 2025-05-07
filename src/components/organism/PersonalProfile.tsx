"use client";

import { useGetFidFlashes } from "~/hooks/api.flashcastrs.app/useGetFidFlashes";
import { useGetFlashStats } from "~/hooks/api.flashcastrs.app/useGetFlashStats";
import { User } from "~/lib/api.flashcastr.app/users";
import { Loading } from "../atom/Loading";
import Feed from "../molecule/Feed";
import { ProfileSettings } from "../molecule/ProfileSettings";

export default function PersonalProfile({ user }: { user: User }) {
  const { data: stats, isLoading: statsLoading } = useGetFlashStats(user.fid);
  const { data: flashes, isLoading: flashesLoading } = useGetFidFlashes(user.fid);

  if (statsLoading || flashesLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col justify-center w-full h-full bg-black">
      <div className="flex flex-col items-center gap-2">{stats && <ProfileSettings user={user} flashCount={stats.flashCount} cities={stats.cities.length} />}</div>
      {flashes && <Feed initialFlashes={flashes} fid={user.fid} />}
    </div>
  );
}
