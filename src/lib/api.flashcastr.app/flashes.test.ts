import { beforeEach, describe, expect, it, vi } from "vitest";
import { FlashesApi } from "./flashes";

describe("FlashesApi.saveFlashIdentification", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_FLASHCASTR_API_URL = "https://api.flashcastr.test";
  });

  it("resolves to the unwrapped mutation payload", async () => {
    const flashesApi = new FlashesApi();
    const post = vi.fn().mockResolvedValue({
      data: {
        data: {
          saveFlashIdentification: {
            id: 42,
            matched_flash_id: "123",
            matched_flash_name: "Space Invader",
            similarity: 0.91,
            confidence: 0.85,
          },
        },
      },
    });
    Object.assign(flashesApi, { api: { post } });

    const result = await flashesApi.saveFlashIdentification(
      "bafybeigdyrzt",
      "123",
      "Space Invader",
      0.91,
      0.85
    );

    expect(result).toEqual({
      id: 42,
      matched_flash_id: "123",
      matched_flash_name: "Space Invader",
      similarity: 0.91,
      confidence: 0.85,
    });
  });
});
