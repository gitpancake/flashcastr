import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "~/auth";
import Feed from "~/components/molecule/Feed";
import { ToggleAutoCast } from "~/components/molecule/ToggleAutoCast";
import Setup from "~/components/organism/Setup";
import { FETCH } from "~/lib/constants";
import { serializeDoc } from "~/lib/help/serialize";
import { FlashcastrFlashesDb } from "~/lib/mongodb/flashcastr";
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

    const flashes = await new FlashcastrFlashesDb().getMany(
      {
        "user.fid": session?.user.fid,
      },
      FETCH.INITIAL_PAGE,
      FETCH.LIMIT
    );

    const flashCount = await new FlashcastrFlashesDb().count({ "user.fid": session?.user.fid });

    const cities = await new FlashcastrFlashesDb().getDistinctCities({ "user.fid": session?.user.fid });

    return (
      <div className="flex flex-col justify-center w-full h-full bg-black">
        <div className="flex flex-col items-center gap-2">
          <Image src={neynarUser.pfp_url ?? `/splash.png`} width={64} height={64} alt="Profile" />
          <p className="text-white font-invader text-[32px] tracking-widest my-[-10px]">{neynarUser.username}</p>
          <p className="text-white font-invader text-[24px] tracking-widest my-[-10px]">
            {flashCount} {flashCount === 1 ? "Flashes" : "Flash"}
          </p>
          <p className="text-white font-invader text-[24px] tracking-widest my-[-10px]">
            {cities.length} {cities.length === 1 ? "Cities" : "City"}
          </p>
          <ToggleAutoCast auto_cast={user.auto_cast} />
        </div>
        <Feed initialFlashes={flashes.map(serializeDoc)} />
      </div>
    );
  }

  return <Setup />;
}
