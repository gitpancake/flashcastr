import { describe, expect, it } from "vitest";
import { ALL_BADGES } from "./badges";

describe("ALL_BADGES", () => {
  it("has a unique id for every badge", () => {
    const ids = ALL_BADGES.map((badge) => badge.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });
});
