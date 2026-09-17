import { NextResponse } from "next/server";
import { crossOriginResponse, getSessionFid, isSameOrigin } from "~/lib/apiGuard";
import { usersApi } from "~/lib/api.flashcastr.app/users";

export async function PUT(req: Request) {
  if (!isSameOrigin(req)) {
    return crossOriginResponse();
  }

  const sessionFid = await getSessionFid();
  if (sessionFid === null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { auto_cast } = await req.json();
  if (typeof auto_cast !== "boolean") {
    return NextResponse.json({ error: "auto_cast must be a boolean" }, { status: 400 });
  }

  await usersApi.setAutoCast(sessionFid, auto_cast, process.env.FLASHCASTR_API_KEY!);

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function DELETE(req: Request) {
  if (!isSameOrigin(req)) {
    return crossOriginResponse();
  }

  const sessionFid = await getSessionFid();
  if (sessionFid === null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await usersApi.deleteUser(sessionFid, process.env.FLASHCASTR_API_KEY!);

  return NextResponse.json({ success: true }, { status: 200 });
}
