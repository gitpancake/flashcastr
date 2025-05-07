"use client";

import { redirect } from "next/navigation";
import { use } from "react";
import { Loading } from "~/components/atom/Loading";
import Setup from "~/components/organism/Setup";
import UserProfile from "~/components/organism/UserProfile";
import { useGetUser } from "~/hooks/api.flashcastrs.app/useGetUser";

export default function ProfilePage({ params }: { params: Promise<{ fid: string }> }) {
  const { fid } = use(params);

  if (!fid || isNaN(Number(fid))) {
    redirect("/");
  }

  const { data, isLoading: userLoading } = useGetUser(Number(fid));

  if (userLoading) {
    return <Loading />;
  }

  if (data) {
    return <UserProfile user={data[0]} />;
  }

  return <Setup />;
}
