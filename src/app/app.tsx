import { WithId } from "mongodb";
import Feed from "~/components/molecule/Feed";
import { FETCH } from "~/lib/constants";
import { FlashcastrFlashesDb } from "~/lib/mongodb/flashcastr";
import { Flashcastr } from "~/lib/mongodb/flashcastr/types";

function serializeDoc(doc: WithId<Flashcastr>) {
  return {
    ...doc,
    _id: doc._id?.toString(), // convert ObjectId to string
  };
}

export default async function App() {
  const initialFlashes = await new FlashcastrFlashesDb().getMany({}, FETCH.INITIAL_PAGE, FETCH.LIMIT);

  return <Feed initialFlashes={initialFlashes.map(serializeDoc)} />;
}
