// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { Leaderboard } from "./Leaderboard";

const users = [
  { username: "alice", pfp_url: null, flashCount: 10, citiesCount: 3 },
  { username: "bob", pfp_url: null, flashCount: 30, citiesCount: 1 },
  { username: "carol", pfp_url: null, flashCount: 20, citiesCount: 5 },
];

function getUsernameOrder() {
  return screen.getAllByText(/^(alice|bob|carol)$/).map((el) => el.textContent);
}

describe("Leaderboard", () => {
  afterEach(() => {
    cleanup();
  });

  it("defaults to sorting by flashes with FLASHES header", () => {
    render(<Leaderboard users={users} />);

    expect(screen.getByText("FLASHES")).not.toBeNull();
    expect(getUsernameOrder()).toEqual(["bob", "carol", "alice"]);
  });

  it("re-sorts by cities and updates the header when CITIES is clicked", async () => {
    const { getByText } = render(<Leaderboard users={users} />);

    fireEvent.click(getByText("[C] CITIES"));

    expect(screen.getByText("CITIES")).not.toBeNull();
    expect(getUsernameOrder()).toEqual(["carol", "alice", "bob"]);
  });

  it("marks FLASHES active by default and CITIES active after clicking it", () => {
    const { getByText } = render(<Leaderboard users={users} />);

    const flashesButton = getByText("[F] FLASHES");
    const citiesButton = getByText("[C] CITIES");

    expect(flashesButton.className).toContain("bg-green-400");
    expect(flashesButton.className).toContain("text-black");
    expect(citiesButton.className).not.toContain("bg-green-400");
    expect(citiesButton.className).toContain("text-green-400");

    fireEvent.click(citiesButton);

    expect(citiesButton.className).toContain("bg-green-400");
    expect(citiesButton.className).toContain("text-black");
    expect(flashesButton.className).not.toContain("bg-green-400");
    expect(flashesButton.className).toContain("text-green-400");
  });
});
