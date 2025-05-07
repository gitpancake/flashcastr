import Image from "next/image";
import { redirect } from "next/navigation";
import Feed from "~/components/molecule/Feed";
import Setup from "~/components/organism/Setup";
import { FlashesApi } from "~/lib/api.flashcastr.app/flashes";
import { UsersApi } from "~/lib/api.flashcastr.app/users";
import { FETCH } from "~/lib/constants";
import neynarClient from "~/lib/neynar/client";

export default async function ProfilePage({ params }: { params: Promise<{ fid: string }> }) {
  const { fid } = await params;

  if (!fid || isNaN(Number(fid))) {
    redirect("/");
  }

  const user = await new UsersApi().getUser(Number(fid));

  if (user) {
    const {
      users: [neynarUser],
    } = await neynarClient.fetchBulkUsers({ fids: [Number(fid)] });
    const stats = await new FlashesApi().getFlashStats(Number(fid));
    const flashes = await new FlashesApi().getFlashes(FETCH.INITIAL_PAGE, FETCH.LIMIT, Number(fid));

    return (
      <div className="flex flex-col justify-center w-full h-full bg-black">
        <div className="flex flex-col items-center gap-2">
          <Image src={neynarUser.pfp_url ?? `/splash.png`} width={64} height={64} alt="Profile" />
          <p className="text-white font-invader text-[32px] tracking-widest my-[-10px]">{neynarUser.username}</p>
          <p className="text-white font-invader text-[24px] tracking-widest my-[-10px]">
            {stats.flashCount} {stats.flashCount === 1 ? "Flash" : "Flashes"}
          </p>
          <p className="text-white font-invader text-[24px] tracking-widest my-[-10px]">
            {stats.cities.length} {stats.cities.length === 1 ? "City" : "Cities"}
          </p>
        </div>
        <Feed initialFlashes={flashes} fid={Number(fid)} />
      </div>
    );
  }

  return <Setup />;
}
