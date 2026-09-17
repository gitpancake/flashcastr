import { NextResponse } from "next/server";
import { withApiGuard } from "~/lib/apiGuard";
import { usersApi } from "~/lib/api.flashcastr.app/users";

export const PUT = withApiGuard(async (req, { fid: sessionFid }) => {
  const { auto_cast } = await req.json();
  if (typeof auto_cast !== "boolean") {
    return NextResponse.json({ error: "auto_cast must be a boolean" }, { status: 400 });
  }

  await usersApi.setAutoCast(sessionFid, auto_cast, process.env.FLASHCASTR_API_KEY!);

  return NextResponse.json({ success: true }, { status: 200 });
});

export const DELETE = withApiGuard(async (req, { fid: sessionFid }) => {
  await usersApi.deleteUser(sessionFid, process.env.FLASHCASTR_API_KEY!);

  return NextResponse.json({ success: true }, { status: 200 });
});
