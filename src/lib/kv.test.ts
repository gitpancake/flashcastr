import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notificationDetails = {
  url: "https://example.com/notify",
  token: "test-token",
};

describe("kv notification store", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("without KV env vars", () => {
    beforeEach(() => {
      vi.stubEnv("KV_REST_API_URL", "");
      vi.stubEnv("KV_REST_API_TOKEN", "");
      vi.stubEnv("NEXT_PUBLIC_FRAME_NAME", "flashcastr");
    });

    it("round-trips get/set/delete through an in-memory store", async () => {
      const { getUserNotificationDetails, setUserNotificationDetails, deleteUserNotificationDetails } =
        await import("./kv");

      expect(await getUserNotificationDetails(1)).toBeNull();

      await setUserNotificationDetails(1, notificationDetails);
      expect(await getUserNotificationDetails(1)).toEqual(notificationDetails);

      await deleteUserNotificationDetails(1);
      expect(await getUserNotificationDetails(1)).toBeNull();
    });
  });

  describe("with KV env vars present", () => {
    const redisGet = vi.fn();
    const redisSet = vi.fn();
    const redisDel = vi.fn();

    beforeEach(() => {
      redisGet.mockReset();
      redisSet.mockReset();
      redisDel.mockReset();
      vi.doMock("@upstash/redis", () => ({
        Redis: vi.fn().mockImplementation(() => ({
          get: redisGet,
          set: redisSet,
          del: redisDel,
        })),
      }));
      vi.stubEnv("KV_REST_API_URL", "https://kv.example.com");
      vi.stubEnv("KV_REST_API_TOKEN", "kv-token");
      vi.stubEnv("NEXT_PUBLIC_FRAME_NAME", "flashcastr");
    });

    it("delegates get/set/delete to the Redis client", async () => {
      redisGet.mockResolvedValue(notificationDetails);

      const { getUserNotificationDetails, setUserNotificationDetails, deleteUserNotificationDetails } =
        await import("./kv");

      const result = await getUserNotificationDetails(1);
      expect(redisGet).toHaveBeenCalledWith("flashcastr:user:1");
      expect(result).toEqual(notificationDetails);

      await setUserNotificationDetails(1, notificationDetails);
      expect(redisSet).toHaveBeenCalledWith("flashcastr:user:1", notificationDetails);

      await deleteUserNotificationDetails(1);
      expect(redisDel).toHaveBeenCalledWith("flashcastr:user:1");
    });
  });
});
