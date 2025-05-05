import { NextRequest } from "next/server";
import { Flashes } from "~/lib/mongodb/flashes";
import { players } from "~/lib/players";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "8", 10);

  const playerUsernames = players.map((player) => player.username);
  const flashes = await new Flashes().getMany({ player: { $in: playerUsernames } }, page, limit);

  return Response.json(flashes);
}
