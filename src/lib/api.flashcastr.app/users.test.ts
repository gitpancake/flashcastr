import { beforeEach, describe, expect, it, vi } from "vitest";
import { UsersApi } from "./users";

describe("UsersApi.setAutoCast", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_FLASHCASTR_API_URL = "https://api.flashcastr.test";
  });

  it("resolves to the unwrapped mutation payload", async () => {
    const usersApi = new UsersApi();
    const post = vi.fn().mockResolvedValue({
      data: { data: { setUserAutoCast: { auto_cast: true } } },
    });
    Object.assign(usersApi, { api: { post } });

    const result = await usersApi.setAutoCast(123, true, "test-api-key");

    expect(result).toEqual({ auto_cast: true });
  });
});
