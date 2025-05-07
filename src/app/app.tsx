import Link from "next/link";
import { getSession } from "~/auth";
import Feed from "~/components/molecule/Feed";
import { FlashesApi } from "~/lib/api.flashcastr.app/flashes";
import { UsersApi } from "~/lib/api.flashcastr.app/users";
import { FETCH } from "~/lib/constants";

export default async function App() {
  const session = await getSession();

  const initialUser = await new UsersApi().getUser(session?.user.fid);
  const initialFlashes = await new FlashesApi().getFlashes(FETCH.INITIAL_PAGE, FETCH.LIMIT);

  return (
    <>
      {!initialUser && (
        <div className="p-4 flex justify-center w-full">
          <Link href={"/profile"} className="bg-[#8A63D2] hover:bg-purple-600 text-white text-center font-invader text-lg animate-pulse py-1 px-4 rounded transition-colors tracking-widest">
            Get Started
          </Link>
        </div>
      )}
      <Feed initialFlashes={initialFlashes} />
    </>
  );
}
