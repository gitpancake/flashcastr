import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

function buildRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/identify", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/identify", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_FLASHCASTR_API_URL = "https://api.flashcastr.test";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects an image_url on a disallowed host without calling fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      buildRequest({ ipfs_cid: "abc123", image_url: "https://169.254.169.254/evil" })
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid ipfs_cid", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      buildRequest({ ipfs_cid: "abc/123", image_url: "https://api.flashcastr.test/i/abc123" })
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches the allowlisted image_url and returns the embeddings result", async () => {
    const imageBlob = new Blob(["fake-image-bytes"], { type: "image/jpeg" });
    const embeddingsResult = { matches: [{ id: "flash-1", score: 0.9 }] };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(imageBlob, { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(embeddingsResult), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const allowedImageUrl = "https://api.flashcastr.test/i/abc123";
    const response = await POST(buildRequest({ ipfs_cid: "abc123", image_url: allowedImageUrl }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(embeddingsResult);
    expect(fetchMock).toHaveBeenNthCalledWith(1, allowedImageUrl);
  });
});
