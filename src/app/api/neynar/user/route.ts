import { NextResponse } from "next/server";
import { getSession } from "~/auth";
import neynarClient from "~/lib/neynar/client";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await neynarClient.fetchBulkUsers({
    fids: [session.user.fid],
  });

  console.log({ user });

  if (!user) {
    return NextResponse.json({ error: "Neynar user not found" }, { status: 404 });
  }

  return NextResponse.json(user.users[0], { status: 200 });
}
