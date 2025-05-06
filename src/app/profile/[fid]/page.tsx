import Image from "next/image";
import { redirect } from "next/navigation";
import Feed from "~/components/molecule/Feed";
import Setup from "~/components/organism/Setup";
import { FETCH } from "~/lib/constants";
import { serializeFlashcastr } from "~/lib/help/serialize";
import { FlashcastrFlashesDb } from "~/lib/mongodb/flashcastr";
import { Users } from "~/lib/mongodb/users";
import neynarClient from "~/lib/neynar/client";

export default async function ProfilePage({ params }: { params: Promise<{ fid: string }> }) {
  const { fid } = await params;

  if (!fid || isNaN(Number(fid))) {
    redirect("/");
  }

  const user = await new Users().getExcludingSigner({ fid: Number(fid) });

  if (user) {
    const {
      users: [neynarUser],
    } = await neynarClient.fetchBulkUsers({ fids: [Number(fid)] });

    const flashes = await new FlashcastrFlashesDb().getMany(
      {
        "user.fid": Number(fid),
      },
      FETCH.INITIAL_PAGE,
      FETCH.LIMIT
    );

    const flashCount = await new FlashcastrFlashesDb().count({ "user.fid": Number(fid) });
    const cities = await new FlashcastrFlashesDb().getDistinctCities({ "user.fid": Number(fid) });

    return (
      <div className="flex flex-col justify-center w-full h-full bg-black">
        <div className="flex flex-col items-center gap-2">
          <Image src={neynarUser.pfp_url ?? `/splash.png`} width={64} height={64} alt="Profile" />
          <p className="text-white font-invader text-[32px] tracking-widest my-[-10px]">{neynarUser.username}</p>
          <p className="text-white font-invader text-[24px] tracking-widest my-[-10px]">
            {flashCount} {flashCount === 1 ? "Flash" : "Flashes"}
          </p>
          <p className="text-white font-invader text-[24px] tracking-widest my-[-10px]">
            {cities.length} {cities.length === 1 ? "City" : "Cities"}
          </p>
        </div>
        <Feed initialFlashes={flashes.map(serializeFlashcastr)} fid={Number(fid)} />
      </div>
    );
  }

  return <Setup />;
}
