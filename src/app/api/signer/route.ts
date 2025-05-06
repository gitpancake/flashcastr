import { NextResponse } from "next/server";
import { Users } from "~/lib/mongodb/users";
import neynarClient from "~/lib/neynar/client";
import { getSignedKey } from "~/lib/neynar/getSignedKey";

export async function POST() {
  try {
    const signedKey = await getSignedKey(true);

    return NextResponse.json(signedKey, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const signer_uuid = searchParams.get("signer_uuid");
  const username = searchParams.get("username");

  if (!signer_uuid) {
    return NextResponse.json({ error: "signer_uuid is required" }, { status: 400 });
  }

  try {
    const signer = await neynarClient.lookupSigner({ signerUuid: signer_uuid });

    if (signer.status === "approved" && signer.fid && username) {
      await new Users().insert({
        fid: signer.fid,
        signer_uuid: signer.signer_uuid,
        username,
        auto_cast: false,
      });
    }

    return NextResponse.json(
      {
        fid: signer.fid,
        username,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
