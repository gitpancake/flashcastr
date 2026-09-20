import { describe, expect, it, vi } from "vitest";
import { unifiedFlashesApi } from "~/lib/api.flashcastr.app/globalFlashes";

vi.mock("~/lib/api.flashcastr.app/globalFlashes", () => ({
  unifiedFlashesApi: {
    getUnifiedFlash: vi.fn(),
  },
}));

const baseFlash = {
  flash_id: 42,
  city: "Paris",
  player: "alice",
  img: "img.png",
  ipfs_cid: "cid",
  text: "hi",
  timestamp: 1700000000,
  flash_count: "3",
  farcaster_user: null,
  identification: null,
};

describe("generateMetadata", () => {
  it("includes openGraph/twitter images and fc:frame when image_url is present", async () => {
    vi.mocked(unifiedFlashesApi.getUnifiedFlash).mockResolvedValue({
      ...baseFlash,
      image_url: "https://api.flashcastr.app/i/42",
    });
    const { generateMetadata } = await import("./page");

    const metadata = await generateMetadata({ params: Promise.resolve({ id: "42" }) });

    expect(metadata.openGraph?.images).toBeDefined();
    expect(metadata.twitter?.images).toBeDefined();
    expect(metadata.other?.["fc:frame"]).toContain("https://api.flashcastr.app/i/42");
  });

  it("omits openGraph.images, twitter.images, and other when image_url is null", async () => {
    vi.mocked(unifiedFlashesApi.getUnifiedFlash).mockResolvedValue({
      ...baseFlash,
      image_url: null,
    });
    const { generateMetadata } = await import("./page");

    const metadata = await generateMetadata({ params: Promise.resolve({ id: "42" }) });

    expect(metadata.openGraph).not.toHaveProperty("images");
    expect(metadata.twitter).not.toHaveProperty("images");
    expect(metadata).not.toHaveProperty("other");
  });
});
