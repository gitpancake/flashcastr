import { Filter } from "mongodb";
import { NextRequest } from "next/server";
import { Flashes } from "~/lib/mongodb/flashes";
import { Flash } from "~/lib/mongodb/flashes/types";
import { players } from "~/lib/players";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "8", 10);
  const search = searchParams.get("search")?.trim() || "";

  const playerUsernames = players.map((player) => player.username);

  let filter: Filter<Flash> = { player: { $in: playerUsernames } };

  if (search) {
    filter = {
      $and: [
        { player: { $in: playerUsernames } },
        {
          $or: [{ player: { $regex: search, $options: "i" } }, { city: { $regex: search, $options: "i" } }],
        },
      ],
    };
  }

  const flashes = await new Flashes().getMany(filter, page, limit);

  return Response.json(flashes);
}
