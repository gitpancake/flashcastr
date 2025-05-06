import { Filter } from "mongodb";
import { NextRequest } from "next/server";
import { FlashcastrFlashesDb } from "~/lib/mongodb/flashcastr";
import { Flashcastr } from "~/lib/mongodb/flashcastr/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "8", 10);
  const search = searchParams.get("search")?.trim() || "";
  const fid = parseInt(searchParams.get("fid") || "0", 10);

  let filter: Filter<Flashcastr> = {};

  if (search) {
    filter = {
      $or: [{ user: { username: { $regex: search, $options: "i" } } }, { flash: { city: { $regex: search, $options: "i" } } }],
    };
  }

  if (fid) {
    filter = {
      ...filter,
      "user.fid": fid,
    };
  }

  const flashes = await new FlashcastrFlashesDb().getMany(filter, page, limit);

  return Response.json(flashes);
}
