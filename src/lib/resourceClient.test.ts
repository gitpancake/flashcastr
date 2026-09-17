import { afterEach, describe, expect, it, vi } from "vitest";
import { getResource, postResource } from "./resourceClient";

describe("getResource", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds a query string from params and returns parsed JSON on ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ hello: "world" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getResource(
      "/api/thing",
      { fid: 123, flag: true, skip: undefined },
      "Failed to load thing"
    );

    expect(fetchMock).toHaveBeenCalledWith("/api/thing?fid=123&flag=true");
    expect(result).toEqual({ hello: "world" });
  });

  it("fetches the bare endpoint with no query string for empty params", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    await getResource("/api/thing", {}, "Failed to load thing");

    expect(fetchMock).toHaveBeenCalledWith("/api/thing");
  });

  it("throws a formatted error when the response is not ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getResource("/api/thing", {}, "Failed to load thing")
    ).rejects.toThrow("Failed to load thing: 404");
  });
});

describe("postResource", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts JSON and returns parsed JSON on ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await postResource(
      "/api/thing",
      { fid: 1, action: "add" },
      "Failed to add thing"
    );

    expect(fetchMock).toHaveBeenCalledWith("/api/thing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fid: 1, action: "add" }),
    });
    expect(result).toEqual({ success: true });
  });

  it("throws a formatted error when the response is not ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      postResource("/api/thing", { fid: 1 }, "Failed to add thing")
    ).rejects.toThrow("Failed to add thing: 500");
  });
});
