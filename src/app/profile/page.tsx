import { redirect } from "next/navigation";
import { getSession } from "~/auth";
import Feed from "~/components/molecule/Feed";
import { ProfileSettings } from "~/components/molecule/ProfileSettings";
import Setup from "~/components/organism/Setup";
import { FETCH } from "~/lib/constants";
import { serializeFlashcastr, serializeUser } from "~/lib/help/serialize";
import { FlashcastrFlashesDb } from "~/lib/mongodb/flashcastr";
import { Users } from "~/lib/mongodb/users";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const user = await new Users().getExcludingSigner({ fid: session?.user.fid });

  if (user) {
    const db = new FlashcastrFlashesDb();

    const flashes = await db.getMany(
      {
        "user.fid": session?.user.fid,
      },
      FETCH.INITIAL_PAGE,
      FETCH.LIMIT
    );

    const flashCount = await db.count({ "user.fid": session?.user.fid });
    const cities = await db.getDistinctCities({ "user.fid": session?.user.fid });

    return (
      <div className="flex flex-col justify-center w-full h-full bg-black">
        <div className="flex flex-col items-center gap-2">
          <ProfileSettings user={serializeUser(user)} flashCount={flashCount} cities={cities.length} />
        </div>
        <Feed initialFlashes={flashes.map(serializeFlashcastr)} fid={session?.user.fid} />
      </div>
    );
  }

  return <Setup />;
}
