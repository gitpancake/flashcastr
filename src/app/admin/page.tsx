"use client";

import { Loading } from "~/components/atom/Loading";
import { AdminPanel } from "~/components/molecule/AdminPanel";
import { useFrame } from "~/components/providers/FrameProvider";
import { FEATURES } from "~/lib/constants";

export default function AdminPage() {
  const { context } = useFrame();
  const farcasterFid = context?.user?.fid;

  // Show loading while checking auth
  if (!context) {
    return <Loading />;
  }

  // Check if user is admin
  if (!farcasterFid || farcasterFid !== FEATURES.ADMIN_FID) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen bg-black text-white p-4 font-mono">
        <div className="text-center max-w-md">
          <h1 className="text-red-400 text-2xl mb-4">ACCESS DENIED</h1>
          <p className="text-gray-300 mb-4">You do not have permission to access the admin panel.</p>
          <div className="text-gray-500 text-sm">
            <p>This page is restricted to system administrators only.</p>
          </div>
        </div>
      </div>
    );
  }

  return <AdminPanel adminFid={farcasterFid} />;
}