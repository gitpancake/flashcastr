// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LOCAL_STORAGE_KEYS } from "~/lib/constants";

vi.mock("~/lib/api.flashcastr.app/users", () => ({
  usersApi: { pollSignupStatus: vi.fn() },
}));

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn() },
}));

import { usersApi, type PollSignupStatusResponse } from "~/lib/api.flashcastr.app/users";
import toast from "react-hot-toast";
import { usePollSigner } from "./usePollSigner";

const pollSignupStatus = vi.mocked(usersApi.pollSignupStatus);
const toastError = vi.mocked(toast.error);

async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function mountPoller(overrides: Partial<Parameters<typeof usePollSigner>[0]> = {}) {
  const onSuccess = vi.fn();
  const onError = vi.fn();
  const onSettled = vi.fn();
  const { unmount } = renderHook(() =>
    usePollSigner({
      signerUuid: "signer-uuid",
      username: "bob",
      onSuccess,
      onError,
      onSettled,
      enabled: true,
      ...overrides,
    })
  );
  return { onSuccess, onError, onSettled, unmount };
}

describe("usePollSigner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    pollSignupStatus.mockReset();
    toastError.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("APPROVED_FINALIZED with a user calls onSuccess, stores fid, and settles without a toast", async () => {
    const user = { fid: 42, username: "bob", auto_cast: false };
    pollSignupStatus.mockResolvedValueOnce({
      status: "APPROVED_FINALIZED",
      user,
    } satisfies PollSignupStatusResponse);

    const { onSuccess, onError, onSettled, unmount } = mountPoller();
    await flushMicrotasks();

    expect(onSuccess).toHaveBeenCalledWith(user);
    expect(onError).not.toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.FARCASTER_FID)).toBe("42");

    unmount();
  });

  it("APPROVED_FINALIZED with missing user data reports the error and toasts", async () => {
    pollSignupStatus.mockResolvedValueOnce({
      status: "APPROVED_FINALIZED",
      fid: 7,
      user: null,
      message: "Custom missing-user message",
    } satisfies PollSignupStatusResponse);

    const { onSuccess, onError, onSettled, unmount } = mountPoller();
    await flushMicrotasks();

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith("Custom missing-user message", 7);
    expect(toastError).toHaveBeenCalledWith("Custom missing-user message");
    expect(onSettled).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("APPROVED_FINALIZED with missing user data and no message falls back to the default message", async () => {
    pollSignupStatus.mockResolvedValueOnce({
      status: "APPROVED_FINALIZED",
      fid: 7,
      user: null,
    } satisfies PollSignupStatusResponse);

    const { onError, onSettled, unmount } = mountPoller();
    await flushMicrotasks();

    expect(onError).toHaveBeenCalledWith("Signup approved but user data is missing.", 7);
    expect(toastError).toHaveBeenCalledWith("Signup approved but user data is missing.");
    expect(onSettled).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("REVOKED reports the error, toasts, and settles", async () => {
    pollSignupStatus.mockResolvedValueOnce({
      status: "REVOKED",
      fid: 9,
      message: "Signer was revoked by user",
    } satisfies PollSignupStatusResponse);

    const { onError, onSuccess, onSettled, unmount } = mountPoller();
    await flushMicrotasks();

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith("Signer was revoked by user", 9);
    expect(toastError).toHaveBeenCalledWith("Signer was revoked by user");
    expect(onSettled).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("ERROR_NEYNAR_LOOKUP falls back to the default message when none is provided", async () => {
    pollSignupStatus.mockResolvedValueOnce({
      status: "ERROR_NEYNAR_LOOKUP",
      fid: 3,
    } satisfies PollSignupStatusResponse);

    const { onError, onSettled, unmount } = mountPoller();
    await flushMicrotasks();

    expect(onError).toHaveBeenCalledWith("An error occurred during Neynar lookup.", 3);
    expect(toastError).toHaveBeenCalledWith("An error occurred during Neynar lookup.");
    expect(onSettled).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("ERROR_FINALIZATION falls back to the default message when none is provided", async () => {
    pollSignupStatus.mockResolvedValueOnce({
      status: "ERROR_FINALIZATION",
      fid: 4,
    } satisfies PollSignupStatusResponse);

    const { onError, onSettled, unmount } = mountPoller();
    await flushMicrotasks();

    expect(onError).toHaveBeenCalledWith("An error occurred during signup finalization.", 4);
    expect(toastError).toHaveBeenCalledWith("An error occurred during signup finalization.");
    expect(onSettled).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("an unknown status containing ERROR reports the error and settles", async () => {
    pollSignupStatus.mockResolvedValueOnce({
      status: "ERROR_SOMETHING_WEIRD",
      fid: 5,
    } satisfies PollSignupStatusResponse);

    const { onError, onSettled, unmount } = mountPoller();
    await flushMicrotasks();

    expect(onError).toHaveBeenCalledWith("An unknown error occurred: ERROR_SOMETHING_WEIRD", 5);
    expect(toastError).toHaveBeenCalledWith("An unknown error occurred: ERROR_SOMETHING_WEIRD");
    expect(onSettled).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("an unknown non-error status keeps polling without calling onError, onSuccess, or toasting", async () => {
    pollSignupStatus.mockResolvedValueOnce({
      status: "SOMETHING_ELSE",
    } satisfies PollSignupStatusResponse);

    const { onError, onSuccess, onSettled, unmount } = mountPoller();
    await flushMicrotasks();

    expect(onError).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
    expect(onSettled).not.toHaveBeenCalled();

    unmount();
  });

  it("PENDING_APPROVAL keeps polling on the interval without settling", async () => {
    pollSignupStatus.mockResolvedValue({
      status: "PENDING_APPROVAL",
    } satisfies PollSignupStatusResponse);

    const { onError, onSuccess, onSettled, unmount } = mountPoller();
    await flushMicrotasks();

    expect(pollSignupStatus).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(pollSignupStatus).toHaveBeenCalledTimes(2);
    expect(onError).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
    expect(onSettled).not.toHaveBeenCalled();

    unmount();
  });

  it("a thrown exception reports the error message, toasts, and settles", async () => {
    pollSignupStatus.mockRejectedValueOnce(new Error("network exploded"));

    const { onError, onSettled, unmount } = mountPoller();
    await flushMicrotasks();

    expect(onError).toHaveBeenCalledWith("network exploded", undefined);
    expect(toastError).toHaveBeenCalledWith("network exploded");
    expect(onSettled).toHaveBeenCalledTimes(1);

    unmount();
  });
});
