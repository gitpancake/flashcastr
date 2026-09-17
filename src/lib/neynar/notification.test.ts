import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import neynarClient from "./client";
import { sendNeynarFrameNotification } from "./notification";

vi.mock("./client", () => ({
  default: {
    publishFrameNotifications: vi.fn(),
  },
}));

const mockPublishFrameNotifications = vi.mocked(neynarClient.publishFrameNotifications);

describe("sendNeynarFrameNotification", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_URL = "https://frame.test";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns success when at least one delivery goes through", async () => {
    mockPublishFrameNotifications.mockResolvedValue({
      notification_deliveries: [{ fid: 1, status: "success" }],
    } as never);

    const result = await sendNeynarFrameNotification({ fid: 1, title: "hi", body: "there" });

    expect(result).toEqual({ state: "success" });
  });

  it("returns no_token when there are no deliveries", async () => {
    mockPublishFrameNotifications.mockResolvedValue({
      notification_deliveries: [],
    } as never);

    const result = await sendNeynarFrameNotification({ fid: 1, title: "hi", body: "there" });

    expect(result).toEqual({ state: "no_token" });
  });

  it("returns error when the client throws", async () => {
    const thrown = new Error("network down");
    mockPublishFrameNotifications.mockRejectedValue(thrown);

    const result = await sendNeynarFrameNotification({ fid: 1, title: "hi", body: "there" });

    expect(result).toEqual({ state: "error", error: thrown });
  });
});
