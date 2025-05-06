import Feed from "~/components/molecule/Feed";
import { FETCH } from "~/lib/constants";
import { serializeDoc } from "~/lib/help/serialize";
import { FlashcastrFlashesDb } from "~/lib/mongodb/flashcastr";

export default async function App() {
  const initialFlashes = await new FlashcastrFlashesDb().getMany({}, FETCH.INITIAL_PAGE, FETCH.LIMIT);

  return <Feed initialFlashes={initialFlashes.map(serializeDoc)} />;
}
