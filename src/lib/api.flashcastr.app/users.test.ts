import { beforeEach, describe, expect, it, vi } from "vitest";
import { UsersApi } from "./users";

describe("UsersApi.checkSignerStatus", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_FLASHCASTR_API_URL = "https://api.flashcastr.test";
  });

  it("throws when the response is missing the expected data shape", async () => {
    const usersApi = new UsersApi();
    const post = vi.fn().mockResolvedValue({ data: { data: null } });
    Object.assign(usersApi, { api: { post } });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(usersApi.checkSignerStatus(123)).rejects.toThrow(
      "Failed to check signer status or malformed response."
    );

    consoleError.mockRestore();
  });
});

describe("UsersApi.deleteUser", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_FLASHCASTR_API_URL = "https://api.flashcastr.test";
  });

  it("sends the API key as an X-API-KEY header through the facade", async () => {
    const usersApi = new UsersApi();
    const post = vi.fn().mockResolvedValue({
      data: { data: { deleteUser: { success: true, message: "gone" } } },
    });
    Object.assign(usersApi, { api: { post } });

    await usersApi.deleteUser(123, "test-api-key");

    expect(post).toHaveBeenCalledWith(
      "/graphql",
      expect.any(Object),
      { headers: { "X-API-KEY": "test-api-key" } }
    );
  });
});

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
