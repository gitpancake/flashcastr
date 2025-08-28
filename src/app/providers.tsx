"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { FrameProvider } from "~/components/providers/FrameProvider";
import WagmiProvider from "~/components/providers/WagmiProvider";

export function Providers({ session, children }: { session: Session | null; children: React.ReactNode }) {
  return (
    <SessionProvider session={session}>
      <WagmiProvider>
        <FrameProvider>{children}</FrameProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}
