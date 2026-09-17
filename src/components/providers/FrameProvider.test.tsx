// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { onMock, readyMock, removeAllListenersMock } = vi.hoisted(() => ({
  onMock: vi.fn(),
  readyMock: vi.fn(),
  removeAllListenersMock: vi.fn(),
}));

vi.mock("@farcaster/frame-sdk", () => ({
  default: {
    context: Promise.resolve({ user: { fid: 1 } }),
    on: onMock,
    removeAllListeners: removeAllListenersMock,
    actions: {
      ready: readyMock,
    },
  },
}));

vi.mock("mipd", () => ({
  createStore: () => ({
    subscribe: vi.fn(),
  }),
}));

import { FrameProvider, useFrame } from "./FrameProvider";

function Consumer({ testId }: { testId: string }) {
  const { context } = useFrame();
  return <div data-testid={testId}>{context?.user?.fid ?? "no-context"}</div>;
}

describe("useFrame", () => {
  beforeEach(() => {
    onMock.mockClear();
    readyMock.mockClear();
    removeAllListenersMock.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("throws when called outside a FrameProvider", () => {
    const renderOutsideProvider = () => render(<Consumer testId="outside" />);

    expect(renderOutsideProvider).toThrow(/FrameProvider/);
  });

  it("returns the bootstrap context value when called inside a FrameProvider", async () => {
    render(
      <FrameProvider>
        <Consumer testId="inside" />
      </FrameProvider>
    );

    const consumer = await screen.findByTestId("inside");
    expect(consumer.textContent).toBe("1");
  });

  it("registers each sdk event listener exactly once total, even with multiple consumers", async () => {
    render(
      <FrameProvider>
        <Consumer testId="first" />
        <Consumer testId="second" />
      </FrameProvider>
    );

    await screen.findByTestId("first");
    await screen.findByTestId("second");

    expect(onMock).toHaveBeenCalledTimes(6);
  });
});
