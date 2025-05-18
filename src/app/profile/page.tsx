"use client";

import { Loading } from "~/components/atom/Loading";
import PersonalProfile from "~/components/organism/PersonalProfile";
import { useFrame } from "~/components/providers/FrameProvider";
import { useGetUser } from "~/hooks/api.flashcastrs.app/useGetUser";

export default function ProfilePage() {
  const { context } = useFrame();

  const farcasterFid = context?.user?.fid;

  const { data: appUserArray, isLoading: userLoading } = useGetUser(farcasterFid);

  if (userLoading) {
    return <Loading />;
  }

  const appUser = appUserArray && appUserArray.length > 0 ? appUserArray[0] : undefined;

  return <PersonalProfile user={appUser} farcasterUserContext={context?.user} />;
}
