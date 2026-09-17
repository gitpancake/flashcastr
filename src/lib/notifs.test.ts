import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getUserNotificationDetails } from "~/lib/kv";
import { sendFrameNotification } from "./notifs";

vi.mock("~/lib/kv", () => ({
  getUserNotificationDetails: vi.fn(),
}));

const mockGetUserNotificationDetails = vi.mocked(getUserNotificationDetails);

describe("sendFrameNotification", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_URL = "https://frame.test";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns no_token when the user has no notification details", async () => {
    mockGetUserNotificationDetails.mockResolvedValue(null);

    const result = await sendFrameNotification({ fid: 1, title: "hi", body: "there" });

    expect(result).toEqual({ state: "no_token" });
  });

  it("returns success when the notification service accepts with no rate-limited tokens", async () => {
    mockGetUserNotificationDetails.mockResolvedValue({ url: "https://notif.test/send", token: "tok-1" });
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        result: { successfulTokens: ["tok-1"], invalidTokens: [], rateLimitedTokens: [] },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendFrameNotification({ fid: 1, title: "hi", body: "there" });

    expect(result).toEqual({ state: "success" });
  });

  it("returns rate_limit when the token was rate-limited", async () => {
    mockGetUserNotificationDetails.mockResolvedValue({ url: "https://notif.test/send", token: "tok-1" });
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        result: { successfulTokens: [], invalidTokens: [], rateLimitedTokens: ["tok-1"] },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendFrameNotification({ fid: 1, title: "hi", body: "there" });

    expect(result).toEqual({ state: "rate_limit" });
  });

  it("returns error when the notification service responds with a non-200 status", async () => {
    mockGetUserNotificationDetails.mockResolvedValue({ url: "https://notif.test/send", token: "tok-1" });
    const errorBody = { message: "boom" };
    const fetchMock = vi.fn().mockResolvedValue({
      status: 500,
      json: async () => errorBody,
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendFrameNotification({ fid: 1, title: "hi", body: "there" });

    expect(result).toEqual({ state: "error", error: errorBody });
  });

  it("returns error when the 200 response body fails schema validation", async () => {
    mockGetUserNotificationDetails.mockResolvedValue({ url: "https://notif.test/send", token: "tok-1" });
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ unexpected: "shape" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendFrameNotification({ fid: 1, title: "hi", body: "there" });

    expect(result.state).toBe("error");
  });
});
