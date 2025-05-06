import { WithId } from "mongodb";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "~/auth";
import Feed from "~/components/molecule/Feed";
import Setup from "~/components/organism/Setup";
import { FETCH } from "~/lib/constants";
import { FlashcastrFlashesDb } from "~/lib/mongodb/flashcastr";
import { Flashcastr } from "~/lib/mongodb/flashcastr/types";
import { Users } from "~/lib/mongodb/users";
import neynarClient from "~/lib/neynar/client";

function serializeDoc(doc: WithId<Flashcastr>) {
  return {
    ...doc,
    _id: doc._id?.toString(), // convert ObjectId to string
  };
}

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
        user: { fid: session?.user.fid },
      },
      FETCH.INITIAL_PAGE,
      FETCH.LIMIT
    );

    return (
      <div className="flex flex-col justify-center w-full h-full bg-black">
        <div className="flex flex-col items-center gap-2">
          <Image src={neynarUser.pfp_url ?? `/splash.png`} width={64} height={64} alt="Profile" />
          <p className="text-white font-invader text-[32px] tracking-widest my-[-10px]">{neynarUser.username}</p>
          <p className="text-white font-invader text-[24px] tracking-widest my-[-10px]">{flashes.length} Flashes</p>
        </div>
        <Feed initialFlashes={flashes.map(serializeDoc)} />
      </div>
    );
  }

  return <Setup />;
}
