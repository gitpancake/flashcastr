import { NextRequest, NextResponse } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getSession } from "~/auth";
import { withApiGuard } from "./apiGuard";

vi.mock("~/auth", () => ({
  getSession: vi.fn(),
}));

const mockGetSession = vi.mocked(getSession);

describe("withApiGuard", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("rejects a cross-origin request without invoking the handler", async () => {
    const handler = vi.fn();
    const guarded = withApiGuard(handler);
    const request = new NextRequest("https://app.test/api/thing", {
      headers: { origin: "https://evil.test", host: "app.test" },
    });

    const response = await guarded(request);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Cross-origin request rejected" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("rejects a same-origin request with no session without invoking the handler", async () => {
    mockGetSession.mockResolvedValue(null);
    const handler = vi.fn();
    const guarded = withApiGuard(handler);
    const request = new NextRequest("https://app.test/api/thing", {
      headers: { host: "app.test" },
    });

    const response = await guarded(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("rejects a same-origin request whose session has no numeric fid", async () => {
    mockGetSession.mockResolvedValue({ user: {} } as never);
    const handler = vi.fn();
    const guarded = withApiGuard(handler);
    const request = new NextRequest("https://app.test/api/thing", {
      headers: { host: "app.test" },
    });

    const response = await guarded(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("invokes the handler with the session fid and returns its response", async () => {
    mockGetSession.mockResolvedValue({ user: { fid: 42 } } as never);
    const handlerResponse = NextResponse.json({ ok: true }, { status: 201 });
    const handler = vi.fn().mockResolvedValue(handlerResponse);
    const guarded = withApiGuard(handler);
    const request = new NextRequest("https://app.test/api/thing", {
      headers: { host: "app.test" },
    });

    const response = await guarded(request);

    expect(handler).toHaveBeenCalledWith(request, { fid: 42 });
    expect(response).toBe(handlerResponse);
  });

  it("returns a generic 500 without invoking the handler when session resolution throws", async () => {
    mockGetSession.mockRejectedValue(new Error("boom"));
    const handler = vi.fn();
    const guarded = withApiGuard(handler);
    const request = new NextRequest("https://app.test/api/thing", {
      headers: { host: "app.test" },
    });

    const response = await guarded(request);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Internal server error" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("uses a custom unauthorized response when provided", async () => {
    mockGetSession.mockResolvedValue(null);
    const handler = vi.fn();
    const guarded = withApiGuard(handler, {
      unauthorized: () => NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }),
    });
    const request = new NextRequest("https://app.test/api/thing", {
      headers: { host: "app.test" },
    });

    const response = await guarded(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ success: false, error: "Unauthorized" });
    expect(handler).not.toHaveBeenCalled();
  });
});
