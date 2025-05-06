import { NextResponse } from "next/server";
import neynarClient from "~/lib/neynar/client";

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const cast = await neynarClient.publishCast({
      signerUuid: body.signer_uuid,
      text: body.text,
    });

    return NextResponse.json(cast, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
