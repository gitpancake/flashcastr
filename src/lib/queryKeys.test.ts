import { describe, expect, it } from "vitest";
import { queryKeys } from "./queryKeys";

describe("queryKeys.user", () => {
  it("returns a fid-scoped tuple when fid is given", () => {
    expect(queryKeys.user(123)).toEqual(["user", 123]);
  });

  it("omits fid from the tuple when fid is undefined", () => {
    expect(queryKeys.user()).toEqual(["user"]);
  });
});

describe("queryKeys.userFlashes", () => {
  it("returns the single-page fetch key for a fid", () => {
    expect(queryKeys.userFlashes(123)).toEqual(["flashes", 123]);
  });
});

describe("queryKeys.userFlashesFeed", () => {
  it("returns a feed-scoped key distinct from userFlashes for the same fid", () => {
    expect(queryKeys.userFlashesFeed(123)).toEqual(["flashes", "feed", 123]);
    expect(queryKeys.userFlashesFeed(123)).not.toEqual(queryKeys.userFlashes(123));
  });
});

describe("queryKeys.flashStats", () => {
  it("returns the flash stats key for a fid", () => {
    expect(queryKeys.flashStats(123)).toEqual(["flashStats", 123]);
  });
});

describe("queryKeys.leaderboard", () => {
  it("returns the leaderboard key for a limit", () => {
    expect(queryKeys.leaderboard(100)).toEqual(["leaderboard", 100]);
  });
});

describe("queryKeys.progress", () => {
  it("returns the progress key for fid, days, and order", () => {
    expect(queryKeys.progress(123, 7, "ASC")).toEqual(["progress", 123, 7, "ASC"]);
  });
});

describe("queryKeys.globalFlashes", () => {
  it("returns the global flashes key for a city", () => {
    expect(queryKeys.globalFlashes("Austin")).toEqual(["global-flashes", "Austin"]);
  });
});
