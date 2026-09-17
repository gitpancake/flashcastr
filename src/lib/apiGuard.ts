import { NextRequest, NextResponse } from "next/server";
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

export function withApiGuard(
  handler: (request: NextRequest, ctx: { fid: number }) => Promise<NextResponse>,
  options?: { unauthorized?: () => NextResponse }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    if (!isSameOrigin(request)) {
      return crossOriginResponse();
    }

    let fid: number | null;
    try {
      fid = await getSessionFid();
    } catch (error) {
      console.error("Error resolving session:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    if (fid === null) {
      return options?.unauthorized
        ? options.unauthorized()
        : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(request, { fid });
  };
}
