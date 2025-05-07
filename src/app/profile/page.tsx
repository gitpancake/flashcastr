"use client";

import Feed from "~/components/molecule/Feed";
import { ProfileSettings } from "~/components/molecule/ProfileSettings";
import Setup from "~/components/organism/Setup";
import { useFrame } from "~/components/providers/FrameProvider";
import { FlashesApi } from "~/lib/api.flashcastr.app/flashes";
import { UsersApi } from "~/lib/api.flashcastr.app/users";
import { FETCH } from "~/lib/constants";

export default async function ProfilePage() {
  const { context } = useFrame();

  const user = await new UsersApi().getUser(context?.user.fid);

  if (user) {
    const stats = await new FlashesApi().getFlashStats(context?.user.fid);
    const flashes = await new FlashesApi().getFlashes(FETCH.INITIAL_PAGE, FETCH.LIMIT, context?.user.fid);

    return (
      <div className="flex flex-col justify-center w-full h-full bg-black">
        <div className="flex flex-col items-center gap-2">
          <ProfileSettings user={user} flashCount={stats.flashCount} cities={stats.cities.length} />
        </div>
        <Feed initialFlashes={flashes} fid={context?.user.fid} />
      </div>
    );
  }

  return <Setup />;
}
