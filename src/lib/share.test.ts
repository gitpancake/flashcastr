import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateShareText, shareToFarcaster, shareToTwitter } from "./share";
import { GlobalFlash } from "./api.flashcastr.app/globalFlashes";

const flash: GlobalFlash = {
  img: "ipfs://sample-cid",
  city: "Paris",
  text: "Great spot!",
  player: "spacecadet",
  flash_id: 42,
  timestamp: 1700000000,
};

const currentUrl = "https://flashcastr.app/flash/42";

describe("shareToFarcaster", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { open: vi.fn() });
  });

  it("opens the Warpcast compose URL with the encoded share text", () => {
    shareToFarcaster({ flash, currentUrl });

    const expectedText = generateShareText({ flash, currentUrl });
    const expectedUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(expectedText)}`;

    expect(window.open).toHaveBeenCalledWith(expectedUrl, "_blank");
  });
});

describe("shareToTwitter", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { open: vi.fn() });
  });

  it("opens the Twitter intent URL with the encoded share text", () => {
    shareToTwitter({ flash, currentUrl });

    const expectedText = generateShareText({ flash, currentUrl });
    const expectedUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(expectedText)}`;

    expect(window.open).toHaveBeenCalledWith(expectedUrl, "_blank");
  });
});
