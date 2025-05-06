import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "~/auth";
import Feed from "~/components/molecule/Feed";
import Setup from "~/components/organism/Setup";
import { Flashes } from "~/lib/mongodb/flashes";
import { Users } from "~/lib/mongodb/users";
import neynarClient from "~/lib/neynar/client";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const user = await new Users().getExcludingSigner({ fid: session?.user.fid });

  if (user) {
    const {
      users: [neynarUser],
    } = await neynarClient.fetchBulkUsers({ fids: [session?.user.fid] });

    const flashes = await new Flashes().getMany({ player: user.username });

    return (
      <div className="flex flex-col justify-center w-full h-full bg-black">
        <div className="flex flex-col items-center gap-2">
          <Image src={neynarUser.pfp_url ?? `/splash.png`} width={64} height={64} alt="Profile" />
          <p className="text-white font-invader text-[32px] tracking-widest my-[-10px]">{neynarUser.username}</p>
          <p className="text-white font-invader text-[24px] tracking-widest my-[-10px]">{flashes.length} Flashes</p>
        </div>
        <Feed initialFlashes={flashes} />
      </div>
    );
  }

  return <Setup />;
}
