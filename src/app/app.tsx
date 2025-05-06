import { WithId } from "mongodb";
import Feed from "~/components/molecule/Feed";
import { FETCH } from "~/lib/constants";
import { Flashes } from "~/lib/mongodb/flashes";
import { Flash } from "~/lib/mongodb/flashes/types";
import { players } from "~/lib/players";

function serializeDoc(doc: WithId<Flash>) {
  return {
    ...doc,
    _id: doc._id?.toString(), // convert ObjectId to string
  };
}

export default async function App() {
  const initialFlashes = await new Flashes().getMany(
    {
      player: { $in: players.map((player) => player.username) },
    },
    FETCH.INITIAL_PAGE,
    FETCH.LIMIT
  );

  return <Feed initialFlashes={initialFlashes.map(serializeDoc)} />;
}
