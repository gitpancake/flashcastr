"use client";

import { Loading } from "~/components/atom/Loading";
import PersonalProfile from "~/components/organism/PersonalProfile";
import Setup from "~/components/organism/Setup";
import { useFrame } from "~/components/providers/FrameProvider";
import { useGetUser } from "~/hooks/api.flashcastrs.app/useGetUser";

export default function ProfilePage() {
  const { context } = useFrame();

  const { data, isLoading: userLoading } = useGetUser(context?.user.fid);

  if (userLoading) {
    return <Loading />;
  }

  if (data && data.length > 0) {
    const user = data[0];

    return <PersonalProfile user={user} />;
  }

  return <Setup />;
}
