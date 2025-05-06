import Image from "next/image";
import Link from "next/link";
import { getSession } from "~/auth";
import neynarClient from "~/lib/neynar/client";

export const Header = async () => {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const {
    users: [neynarUser],
  } = await neynarClient.fetchBulkUsers({ fids: [session?.user.fid] });

  return (
    <div className="flex w-full justify-between items-center bg-black px-4">
      <Link href="/">
        <Image src="/splash.png" width={1920} height={1080} alt="Flashcastr" className="h-[60px] w-[60px]" />
      </Link>

      <Link href="/profile">
        <Image src={neynarUser.pfp_url ?? `/splash.png`} width={32} height={32} alt="Profile" />
      </Link>
    </div>
  );
};
