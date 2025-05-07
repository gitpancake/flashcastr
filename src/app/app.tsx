import Link from "next/link";
import { getSession } from "~/auth";
import Feed from "~/components/molecule/Feed";
import { FETCH } from "~/lib/constants";
import { serializeFlashcastr } from "~/lib/help/serialize";
import { FlashcastrFlashesDb } from "~/lib/mongodb/flashcastr";
import { Users } from "~/lib/mongodb/users";

export default async function App() {
  const session = await getSession();

  const initialUser = await new Users().getExcludingSigner({ fid: session?.user.fid });

  const initialFlashes = await new FlashcastrFlashesDb().getMany({}, FETCH.INITIAL_PAGE, FETCH.LIMIT);

  return (
    <>
      {!initialUser && (
        <div className="p-4 flex justify-center w-full">
          <Link href={"/profile"} className="bg-[#8A63D2] hover:bg-purple-600 text-white text-center font-invader text-lg animate-pulse py-1 px-4 rounded transition-colors tracking-widest">
            Get Started
          </Link>
        </div>
      )}
      <Feed initialFlashes={initialFlashes.map(serializeFlashcastr)} />
    </>
  );
}
