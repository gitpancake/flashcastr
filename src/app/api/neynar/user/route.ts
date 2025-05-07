import { NextResponse } from "next/server";
import neynarClient from "~/lib/neynar/client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const fid = url.searchParams.get("fid");

  if (!fid) {
    return NextResponse.json({ error: "Fid is required" }, { status: 400 });
  }

  const user = await neynarClient.fetchBulkUsers({
    fids: [Number(fid)],
  });

  if (!user) {
    return NextResponse.json({ error: "Neynar user not found" }, { status: 404 });
  }

  return NextResponse.json(user.users[0], { status: 200 });
}
