import { describe, expect, it } from "vitest";
import {
  ALL_BADGES,
  getBadgeForFlashCount,
  getCityBadgeForCount,
  getNextBadge,
  getNextCityBadge,
} from "./badges";

describe("ALL_BADGES", () => {
  it("has a unique id for every badge", () => {
    const ids = ALL_BADGES.map((badge) => badge.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe("getBadgeForFlashCount", () => {
  it("returns null below the lowest threshold", () => {
    expect(getBadgeForFlashCount(0)).toBeNull();
  });

  it("returns the matching badge exactly on a threshold", () => {
    expect(getBadgeForFlashCount(20)?.id).toBe("scout");
  });

  it("returns the highest eligible badge between two thresholds", () => {
    expect(getBadgeForFlashCount(75)?.id).toBe("invader");
  });

  it("returns the top badge above the highest threshold", () => {
    expect(getBadgeForFlashCount(5000)?.id).toBe("master");
  });
});

describe("getNextBadge", () => {
  it("returns the lowest badge below the lowest threshold", () => {
    expect(getNextBadge(0)?.id).toBe("newbie");
  });

  it("returns the next-higher badge exactly on a threshold", () => {
    expect(getNextBadge(20)?.id).toBe("invader");
  });

  it("returns the next-higher badge between two thresholds", () => {
    expect(getNextBadge(75)?.id).toBe("commander");
  });

  it("returns null above the highest threshold", () => {
    expect(getNextBadge(5000)).toBeNull();
  });
});

describe("getCityBadgeForCount", () => {
  it("returns null below the lowest threshold", () => {
    expect(getCityBadgeForCount(0)).toBeNull();
  });

  it("returns the matching badge exactly on a threshold", () => {
    expect(getCityBadgeForCount(7)?.id).toBe("wanderer");
  });

  it("returns the highest eligible badge between two thresholds", () => {
    expect(getCityBadgeForCount(40)?.id).toBe("city-explorer");
  });

  it("returns the top badge above the highest threshold", () => {
    expect(getCityBadgeForCount(200)?.id).toBe("world_invader");
  });
});

describe("getNextCityBadge", () => {
  it("returns the lowest badge below the lowest threshold", () => {
    expect(getNextCityBadge(0)?.id).toBe("local");
  });

  it("returns the next-higher badge exactly on a threshold", () => {
    expect(getNextCityBadge(7)?.id).toBe("nomad");
  });

  it("returns the next-higher badge between two thresholds", () => {
    expect(getNextCityBadge(40)?.id).toBe("globe_trotter");
  });

  it("returns null above the highest threshold", () => {
    expect(getNextCityBadge(200)).toBeNull();
  });
});
