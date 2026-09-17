import { NextResponse } from "next/server";
import { getSession } from "~/auth";

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function crossOriginResponse(): NextResponse {
  return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
}

export async function getSessionFid(): Promise<number | null> {
  const session = await getSession();
  const fid = session?.user?.fid;
  return typeof fid === "number" && Number.isFinite(fid) ? fid : null;
}
