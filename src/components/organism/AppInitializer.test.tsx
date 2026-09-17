// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("~/components/providers/FrameProvider", () => ({
  useFrame: vi.fn(),
}));
vi.mock("~/hooks/api.flashcastrs.app/useGetUser", () => ({
  useGetUser: vi.fn(),
}));
vi.mock("~/hooks/api.flashcastrs.app/useGetLeaderboard", () => ({
  useGetLeaderboard: vi.fn(),
}));
vi.mock("~/hooks/api.flashcastrs.app/useGetFlashStats", () => ({
  useGetFlashStats: vi.fn(),
}));
vi.mock("~/hooks/useKeyboardShortcuts", () => ({
  useKeyboardShortcuts: vi.fn(),
}));
vi.mock("~/components/molecule/Feed", () => ({
  default: () => <div>FEED_CONTENT</div>,
}));
vi.mock("~/components/molecule/GlobalFlashes", () => ({
  GlobalFlashes: () => <div>GLOBAL_CONTENT</div>,
}));
vi.mock("~/components/molecule/Leaderboard", () => ({
  Leaderboard: () => <div>LEADERBOARD_CONTENT</div>,
}));
vi.mock("~/components/molecule/Progress", () => ({
  Progress: () => <div>PROGRESS_CONTENT</div>,
}));
vi.mock("~/components/molecule/Achievements", () => ({
  Achievements: () => <div>ACHIEVEMENTS_CONTENT</div>,
}));

import AppInitializer from "./AppInitializer";
import { useFrame } from "~/components/providers/FrameProvider";
import { useGetUser } from "~/hooks/api.flashcastrs.app/useGetUser";
import { useGetLeaderboard } from "~/hooks/api.flashcastrs.app/useGetLeaderboard";
import { useGetFlashStats } from "~/hooks/api.flashcastrs.app/useGetFlashStats";

const mockedUseFrame = vi.mocked(useFrame);
const mockedUseGetUser = vi.mocked(useGetUser);
const mockedUseGetLeaderboard = vi.mocked(useGetLeaderboard);
const mockedUseGetFlashStats = vi.mocked(useGetFlashStats);

function mockUnauthenticated() {
  mockedUseFrame.mockReturnValue({ context: undefined } as ReturnType<typeof useFrame>);
}

function mockAuthenticated() {
  mockedUseFrame.mockReturnValue({
    context: { user: { fid: 123, username: "alice" } },
  } as ReturnType<typeof useFrame>);
}

describe("AppInitializer tab dispatch", () => {
  beforeEach(() => {
    mockedUseGetUser.mockReturnValue({ data: [], refetch: vi.fn(), isLoading: false } as unknown as ReturnType<typeof useGetUser>);
    mockedUseGetLeaderboard.mockReturnValue({ data: [] } as unknown as ReturnType<typeof useGetLeaderboard>);
    mockedUseGetFlashStats.mockReturnValue({ data: { flashCount: 0, cities: [] } } as unknown as ReturnType<typeof useGetFlashStats>);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("hides gated tabs and renders public tab content when unauthenticated", () => {
    mockUnauthenticated();
    render(<AppInitializer initialFlashes={[]} />);

    expect(screen.queryByText("PROGRESS")).toBeNull();
    expect(screen.queryByText("ACHIEVE")).toBeNull();
    expect(screen.getByText("FEED_CONTENT")).not.toBeNull();

    fireEvent.click(screen.getByText("GLOBAL"));
    expect(screen.getByText("GLOBAL_CONTENT")).not.toBeNull();

    fireEvent.click(screen.getByText("BOARD"));
    expect(screen.getByText("LEADERBOARD_CONTENT")).not.toBeNull();
  });

  it("shows and renders all 5 tabs when authenticated", () => {
    mockAuthenticated();
    render(<AppInitializer initialFlashes={[]} />);

    fireEvent.click(screen.getByText("PROGRESS"));
    expect(screen.getByText("PROGRESS_CONTENT")).not.toBeNull();

    fireEvent.click(screen.getByText("ACHIEVE"));
    expect(screen.getByText("ACHIEVEMENTS_CONTENT")).not.toBeNull();

    fireEvent.click(screen.getByText("GLOBAL"));
    expect(screen.getByText("GLOBAL_CONTENT")).not.toBeNull();

    fireEvent.click(screen.getByText("BOARD"));
    expect(screen.getByText("LEADERBOARD_CONTENT")).not.toBeNull();

    fireEvent.click(screen.getByText("FEED"));
    expect(screen.getByText("FEED_CONTENT")).not.toBeNull();
  });

  it("falls back to feed content when context is lost while on a gated tab", () => {
    mockAuthenticated();
    const { rerender } = render(<AppInitializer initialFlashes={[]} />);

    fireEvent.click(screen.getByText("PROGRESS"));
    expect(screen.getByText("PROGRESS_CONTENT")).not.toBeNull();

    mockUnauthenticated();
    rerender(<AppInitializer initialFlashes={[]} />);

    expect(screen.getByText("FEED_CONTENT")).not.toBeNull();
  });
});
