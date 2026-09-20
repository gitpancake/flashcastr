import { beforeEach, describe, expect, it, vi } from "vitest";
import { GlobalFlashesApi, UnifiedFlashesApi } from "./globalFlashes";

function withMockedPost(instance: object, post: ReturnType<typeof vi.fn>) {
  Object.assign(instance, { api: { post } });
}

describe("GlobalFlashesApi.getGlobalFlashes", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_FLASHCASTR_API_URL = "https://api.flashcastr.test";
  });

  it("maps flash_id to a number and timestamp via parseTimestamp", async () => {
    const api = new GlobalFlashesApi();
    const post = vi.fn().mockResolvedValue({
      data: {
        data: {
          globalFlashes: [
            { flash_id: "42", city: "Paris", player: "alice", img: "img.png", ipfs_cid: "cid", text: "hi", timestamp: "1700000000", flash_count: "3", image_url: "https://api.flashcastr.app/i/42" },
          ],
        },
      },
    });
    withMockedPost(api, post);

    const result = await api.getGlobalFlashes(1, 40, null);

    expect(result.items).toEqual([
      { flash_id: 42, city: "Paris", player: "alice", img: "img.png", ipfs_cid: "cid", text: "hi", timestamp: 1700000000, image_url: "https://api.flashcastr.app/i/42" },
    ]);
    expect(result.items[0].image_url).toBe("https://api.flashcastr.app/i/42");
  });

  it("maps a null image_url in the API response to null on the item", async () => {
    const api = new GlobalFlashesApi();
    const post = vi.fn().mockResolvedValue({
      data: {
        data: {
          globalFlashes: [
            { flash_id: "42", city: "Paris", player: "alice", img: "img.png", ipfs_cid: "cid", text: "hi", timestamp: "1700000000", flash_count: "3", image_url: null },
          ],
        },
      },
    });
    withMockedPost(api, post);

    const result = await api.getGlobalFlashes(1, 40, null);

    expect(result.items[0].image_url).toBe(null);
  });

  it("rethrows when the GraphQL query errors, so react-query sees isError", async () => {
    const api = new GlobalFlashesApi();
    const post = vi.fn().mockResolvedValue({
      data: { errors: [{ message: "backend unreachable" }] },
    });
    withMockedPost(api, post);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(api.getGlobalFlashes(1, 40, null)).rejects.toThrow("backend unreachable");

    consoleError.mockRestore();
  });
});

describe("GlobalFlashesApi.getGlobalCities", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_FLASHCASTR_API_URL = "https://api.flashcastr.test";
  });

  it("swallows GraphQL errors and returns an empty array", async () => {
    const api = new GlobalFlashesApi();
    const post = vi.fn().mockResolvedValue({
      data: { errors: [{ message: "backend unreachable" }] },
    });
    withMockedPost(api, post);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await api.getGlobalCities();

    expect(result).toEqual([]);
    consoleError.mockRestore();
  });
});

describe("UnifiedFlashesApi.getUnifiedFlash", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_FLASHCASTR_API_URL = "https://api.flashcastr.test";
  });

  it("passes image_url through from the API response", async () => {
    const api = new UnifiedFlashesApi();
    const post = vi.fn().mockResolvedValue({
      data: {
        data: {
          unifiedFlash: {
            flash_id: "42",
            city: "Paris",
            player: "alice",
            img: "img.png",
            ipfs_cid: "cid",
            text: "hi",
            timestamp: "1700000000",
            flash_count: "3",
            image_url: "https://api.flashcastr.app/i/42",
            farcaster_user: null,
            identification: null,
          },
        },
      },
    });
    withMockedPost(api, post);

    const result = await api.getUnifiedFlash(42);

    expect(result?.image_url).toBe("https://api.flashcastr.app/i/42");
  });
});
