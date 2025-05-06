import { NextResponse } from "next/server";
import { getSession } from "~/auth";
import { FlashcastrFlashesDb } from "~/lib/mongodb/flashcastr";
import { Users } from "~/lib/mongodb/users";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await new Users().getExcludingSigner({
    fid: session.user.fid,
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user, { status: 200 });
}

export async function PUT(req: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { auto_cast } = await req.json();

  await new Users().updateDocument({ fid: session.user.fid }, { $set: { auto_cast } });

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function DELETE() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await new Users().deleteDocument({ fid: session.user.fid });
  await new FlashcastrFlashesDb().deleteMany({ "user.fid": session.user.fid });

  return NextResponse.json({ success: true }, { status: 200 });
}
