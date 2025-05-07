import { NextResponse } from "next/server";
import { getSession } from "~/auth";
import { UsersApi } from "~/lib/api.flashcastr.app/users";

export async function PUT(req: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { auto_cast } = await req.json();

  await new UsersApi().setAutoCast(session.user.fid, auto_cast, process.env.FLASHCASTR_API_KEY!);

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function DELETE() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await new UsersApi().deleteUser(session.user.fid, process.env.FLASHCASTR_API_KEY!);

  return NextResponse.json({ success: true }, { status: 200 });
}
