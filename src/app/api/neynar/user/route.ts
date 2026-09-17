import { NextResponse } from "next/server";
import neynarClient from "~/lib/neynar/client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const fid = url.searchParams.get("fid");

  const fidNumber = Number(fid);
  if (!fid || !Number.isInteger(fidNumber) || fidNumber <= 0) {
    return NextResponse.json({ error: "Valid fid is required" }, { status: 400 });
  }

  try {
    const user = await neynarClient.fetchBulkUsers({
      fids: [fidNumber],
    });

    if (!user?.users?.length) {
      return NextResponse.json({ error: "Neynar user not found" }, { status: 404 });
    }

    return NextResponse.json(user.users[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching Neynar user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 502 });
  }
}
