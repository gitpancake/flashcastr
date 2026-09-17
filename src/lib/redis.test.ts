import { beforeEach, describe, expect, it, vi } from "vitest";

const mockClient = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  sMembers: vi.fn(),
  sAdd: vi.fn(),
  sRem: vi.fn(),
  sIsMember: vi.fn(),
  on: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock("redis", () => ({
  createClient: () => mockClient,
}));

process.env.REDIS_URL = "redis://localhost:6379";

import {
  addExperimentalUserRedis,
  addToFavoritesRedis,
  addToWishlistRedis,
  getExperimentalUsersRedis,
  getFavoritesCountRedis,
  getFavoritesFromRedis,
  getInvaderStatusRedis,
  getWishlistFromRedis,
  getWishlistStatsRedis,
  isExperimentalUserRedis,
  isFavoriteRedis,
  isInWishlistRedis,
  markAsAliveRedis,
  markAsDeadRedis,
  removeExperimentalUserRedis,
  removeFromFavoritesRedis,
  removeFromWishlistRedis,
  saveFavoritesToRedis,
  saveWishlistToRedis,
  type FavoriteFlash,
  type UserFavorites,
} from "./redis";
import type { UserWishlist, WishlistItem } from "./wishlist";

const sampleInvader = {
  i: 1,
  n: "FAO_03",
  l: { lat: 1.23, lng: 4.56 },
  t: "https://example.com/img.png",
};

function makeWishlist(items: WishlistItem[] = []): UserWishlist {
  return {
    fid: 42,
    items,
    stats: { total_wanted: 0, total_found: 0, last_updated: "irrelevant" },
  };
}

function makeFavorites(favorites: FavoriteFlash[] = []): UserFavorites {
  return {
    fid: 42,
    favorites,
    stats: { total_count: 0, last_updated: "irrelevant" },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("wishlist family", () => {
  describe("getWishlistFromRedis", () => {
    it("reads the exact key wishlist:<fid>", async () => {
      mockClient.get.mockResolvedValue(null);
      await getWishlistFromRedis(42);
      expect(mockClient.get).toHaveBeenCalledWith("wishlist:42");
    });

    it("returns an empty wishlist when the key is missing", async () => {
      mockClient.get.mockResolvedValue(null);
      const result = await getWishlistFromRedis(42);
      expect(result.fid).toBe(42);
      expect(result.items).toEqual([]);
      expect(result.stats.total_wanted).toBe(0);
      expect(result.stats.total_found).toBe(0);
      expect(typeof result.stats.last_updated).toBe("string");
    });

    it("returns the parsed wishlist when the key exists", async () => {
      const stored = makeWishlist([
        {
          invader_id: "FAO_03",
          invader_name: "FAO_03",
          photo_url: "/invaders/FAO/FAO_03.png",
          coordinates: { lat: 1, lng: 2 },
          added_date: "2026-01-01T00:00:00.000Z",
          status: "want_to_find",
        },
      ]);
      mockClient.get.mockResolvedValue(JSON.stringify(stored));
      const result = await getWishlistFromRedis(42);
      expect(result).toEqual(stored);
    });

    it("returns an empty wishlist when the client throws", async () => {
      mockClient.get.mockRejectedValue(new Error("boom"));
      const result = await getWishlistFromRedis(42);
      expect(result.fid).toBe(42);
      expect(result.items).toEqual([]);
    });
  });

  describe("saveWishlistToRedis", () => {
    it("writes to the exact key wishlist:<fid> with recomputed stats", async () => {
      mockClient.set.mockResolvedValue("OK");
      const wishlist = makeWishlist([
        { invader_id: "A", invader_name: "A", photo_url: "", coordinates: { lat: 0, lng: 0 }, added_date: "x", status: "want_to_find" },
        { invader_id: "B", invader_name: "B", photo_url: "", coordinates: { lat: 0, lng: 0 }, added_date: "x", status: "alive" },
        { invader_id: "C", invader_name: "C", photo_url: "", coordinates: { lat: 0, lng: 0 }, added_date: "x", status: "dead" },
      ]);

      await saveWishlistToRedis(wishlist);

      expect(mockClient.set).toHaveBeenCalledTimes(1);
      const [key, payload] = mockClient.set.mock.calls[0];
      expect(key).toBe("wishlist:42");
      const parsed = JSON.parse(payload);
      expect(parsed.fid).toBe(42);
      expect(parsed.items).toHaveLength(3);
      expect(parsed.stats.total_wanted).toBe(1);
      expect(parsed.stats.total_found).toBe(2);
      expect(typeof parsed.stats.last_updated).toBe("string");
    });

    it("rethrows when the client fails to set", async () => {
      mockClient.set.mockRejectedValue(new Error("write failed"));
      await expect(saveWishlistToRedis(makeWishlist())).rejects.toThrow("write failed");
    });
  });

  describe("addToWishlistRedis", () => {
    it("adds a new item with want_to_find status and saves", async () => {
      mockClient.get.mockResolvedValue(null);
      mockClient.set.mockResolvedValue("OK");

      const result = await addToWishlistRedis(42, sampleInvader);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        invader_id: "FAO_03",
        invader_name: "FAO_03",
        photo_url: "/invaders/FAO/FAO_03.png",
        coordinates: { lat: 1.23, lng: 4.56 },
        status: "want_to_find",
      });
      expect(mockClient.set).toHaveBeenCalledWith("wishlist:42", expect.any(String));
    });

    it("resets an existing found item back to want_to_find", async () => {
      const existing = makeWishlist([
        { invader_id: "FAO_03", invader_name: "FAO_03", photo_url: "old", coordinates: { lat: 0, lng: 0 }, added_date: "old", status: "alive" },
      ]);
      mockClient.get.mockResolvedValue(JSON.stringify(existing));
      mockClient.set.mockResolvedValue("OK");

      const result = await addToWishlistRedis(42, sampleInvader);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].status).toBe("want_to_find");
    });
  });

  describe("removeFromWishlistRedis", () => {
    it("filters the item out and saves", async () => {
      const existing = makeWishlist([
        { invader_id: "A", invader_name: "A", photo_url: "", coordinates: { lat: 0, lng: 0 }, added_date: "x", status: "want_to_find" },
        { invader_id: "B", invader_name: "B", photo_url: "", coordinates: { lat: 0, lng: 0 }, added_date: "x", status: "want_to_find" },
      ]);
      mockClient.get.mockResolvedValue(JSON.stringify(existing));
      mockClient.set.mockResolvedValue("OK");

      const result = await removeFromWishlistRedis(42, "A");

      expect(result.items.map((i) => i.invader_id)).toEqual(["B"]);
      expect(mockClient.set).toHaveBeenCalledTimes(1);
    });
  });

  describe("markAsAliveRedis / markAsDeadRedis", () => {
    it("marks a matching item alive", async () => {
      const existing = makeWishlist([
        { invader_id: "A", invader_name: "A", photo_url: "", coordinates: { lat: 0, lng: 0 }, added_date: "x", status: "want_to_find" },
      ]);
      mockClient.get.mockResolvedValue(JSON.stringify(existing));
      mockClient.set.mockResolvedValue("OK");

      const result = await markAsAliveRedis(42, "A");
      expect(result.items[0].status).toBe("alive");
    });

    it("marks a matching item dead", async () => {
      const existing = makeWishlist([
        { invader_id: "A", invader_name: "A", photo_url: "", coordinates: { lat: 0, lng: 0 }, added_date: "x", status: "want_to_find" },
      ]);
      mockClient.get.mockResolvedValue(JSON.stringify(existing));
      mockClient.set.mockResolvedValue("OK");

      const result = await markAsDeadRedis(42, "A");
      expect(result.items[0].status).toBe("dead");
    });

    it("saves unchanged when the item is not found (no throw)", async () => {
      const existing = makeWishlist([]);
      mockClient.get.mockResolvedValue(JSON.stringify(existing));
      mockClient.set.mockResolvedValue("OK");

      const result = await markAsAliveRedis(42, "missing");
      expect(result.items).toEqual([]);
      expect(mockClient.set).toHaveBeenCalledTimes(1);
    });
  });

  describe("isInWishlistRedis / getInvaderStatusRedis", () => {
    it("returns true/false membership", async () => {
      const existing = makeWishlist([
        { invader_id: "A", invader_name: "A", photo_url: "", coordinates: { lat: 0, lng: 0 }, added_date: "x", status: "want_to_find" },
      ]);
      mockClient.get.mockResolvedValue(JSON.stringify(existing));

      expect(await isInWishlistRedis(42, "A")).toBe(true);
      expect(await isInWishlistRedis(42, "Z")).toBe(false);
    });

    it("returns the item's status or null", async () => {
      const existing = makeWishlist([
        { invader_id: "A", invader_name: "A", photo_url: "", coordinates: { lat: 0, lng: 0 }, added_date: "x", status: "dead" },
      ]);
      mockClient.get.mockResolvedValue(JSON.stringify(existing));

      expect(await getInvaderStatusRedis(42, "A")).toBe("dead");
      expect(await getInvaderStatusRedis(42, "Z")).toBeNull();
    });
  });

  describe("getWishlistStatsRedis", () => {
    it("computes completion rate from stored stats", async () => {
      const existing: UserWishlist = {
        fid: 42,
        items: [1, 2, 3].map((n) => ({
          invader_id: `${n}`,
          invader_name: `${n}`,
          photo_url: "",
          coordinates: { lat: 0, lng: 0 },
          added_date: "x",
          status: "want_to_find",
        })),
        stats: { total_wanted: 1, total_found: 3, last_updated: "x" },
      };
      mockClient.get.mockResolvedValue(JSON.stringify(existing));

      const stats = await getWishlistStatsRedis(42);
      expect(stats).toEqual({
        totalWanted: 1,
        totalFound: 3,
        totalItems: 3,
        completionRate: 75,
      });
    });

    it("returns a 0 completion rate when nothing is tracked", async () => {
      mockClient.get.mockResolvedValue(null);
      const stats = await getWishlistStatsRedis(42);
      expect(stats.completionRate).toBe(0);
    });
  });
});

describe("favorites family", () => {
  const sampleFlash: Omit<FavoriteFlash, "addedAt"> = {
    flash_id: 1,
    player: "player1",
    city: "PAR",
    timestamp: 1000,
  };

  describe("getFavoritesFromRedis", () => {
    it("reads the exact key favorites:<fid>", async () => {
      mockClient.get.mockResolvedValue(null);
      await getFavoritesFromRedis(42);
      expect(mockClient.get).toHaveBeenCalledWith("favorites:42");
    });

    it("returns an empty favorites doc when the key is missing", async () => {
      mockClient.get.mockResolvedValue(null);
      const result = await getFavoritesFromRedis(42);
      expect(result.fid).toBe(42);
      expect(result.favorites).toEqual([]);
      expect(result.stats.total_count).toBe(0);
    });

    it("returns the parsed favorites when the key exists", async () => {
      const stored = makeFavorites([{ ...sampleFlash, addedAt: 123 }]);
      mockClient.get.mockResolvedValue(JSON.stringify(stored));
      const result = await getFavoritesFromRedis(42);
      expect(result).toEqual(stored);
    });

    it("returns an empty favorites doc when the client throws", async () => {
      mockClient.get.mockRejectedValue(new Error("boom"));
      const result = await getFavoritesFromRedis(42);
      expect(result.favorites).toEqual([]);
    });
  });

  describe("saveFavoritesToRedis", () => {
    it("writes to the exact key favorites:<fid> with recomputed stats", async () => {
      mockClient.set.mockResolvedValue("OK");
      const favorites = makeFavorites([{ ...sampleFlash, addedAt: 1 }, { ...sampleFlash, flash_id: 2, addedAt: 2 }]);

      await saveFavoritesToRedis(favorites);

      const [key, payload] = mockClient.set.mock.calls[0];
      expect(key).toBe("favorites:42");
      const parsed = JSON.parse(payload);
      expect(parsed.stats.total_count).toBe(2);
      expect(typeof parsed.stats.last_updated).toBe("string");
    });

    it("rethrows when the client fails to set", async () => {
      mockClient.set.mockRejectedValue(new Error("write failed"));
      await expect(saveFavoritesToRedis(makeFavorites())).rejects.toThrow("write failed");
    });
  });

  describe("addToFavoritesRedis", () => {
    it("adds a new favorite and returns true", async () => {
      mockClient.get.mockResolvedValue(null);
      mockClient.set.mockResolvedValue("OK");

      const added = await addToFavoritesRedis(42, sampleFlash);

      expect(added).toBe(true);
      const [, payload] = mockClient.set.mock.calls[0];
      const parsed = JSON.parse(payload);
      expect(parsed.favorites).toHaveLength(1);
      expect(parsed.favorites[0]).toMatchObject(sampleFlash);
      expect(typeof parsed.favorites[0].addedAt).toBe("number");
    });

    it("returns false without saving when the flash already exists", async () => {
      const existing = makeFavorites([{ ...sampleFlash, addedAt: 1 }]);
      mockClient.get.mockResolvedValue(JSON.stringify(existing));

      const added = await addToFavoritesRedis(42, sampleFlash);

      expect(added).toBe(false);
      expect(mockClient.set).not.toHaveBeenCalled();
    });

    it("rethrows when the underlying save fails", async () => {
      // getFavoritesFromRedis swallows read errors internally, so drive the
      // failure through the save path instead.
      mockClient.get.mockResolvedValue(null);
      mockClient.set.mockRejectedValue(new Error("write failed"));
      await expect(addToFavoritesRedis(42, sampleFlash)).rejects.toThrow("write failed");
    });
  });

  describe("removeFromFavoritesRedis", () => {
    it("returns false when the flash isn't in favorites", async () => {
      mockClient.get.mockResolvedValue(JSON.stringify(makeFavorites([])));
      const removed = await removeFromFavoritesRedis(42, 999);
      expect(removed).toBe(false);
      expect(mockClient.set).not.toHaveBeenCalled();
    });

    it("removes the flash and returns true", async () => {
      const existing = makeFavorites([{ ...sampleFlash, addedAt: 1 }]);
      mockClient.get.mockResolvedValue(JSON.stringify(existing));
      mockClient.set.mockResolvedValue("OK");

      const removed = await removeFromFavoritesRedis(42, sampleFlash.flash_id);
      expect(removed).toBe(true);
      expect(mockClient.set).toHaveBeenCalledTimes(1);
    });
  });

  describe("isFavoriteRedis / getFavoritesCountRedis", () => {
    it("returns membership true/false", async () => {
      const existing = makeFavorites([{ ...sampleFlash, addedAt: 1 }]);
      mockClient.get.mockResolvedValue(JSON.stringify(existing));

      expect(await isFavoriteRedis(42, sampleFlash.flash_id)).toBe(true);
      expect(await isFavoriteRedis(42, 999)).toBe(false);
    });

    it("swallows errors and returns false", async () => {
      mockClient.get.mockRejectedValue(new Error("boom"));
      expect(await isFavoriteRedis(42, 1)).toBe(false);
    });

    it("returns the favorites count", async () => {
      const existing = makeFavorites([{ ...sampleFlash, addedAt: 1 }, { ...sampleFlash, flash_id: 2, addedAt: 2 }]);
      mockClient.get.mockResolvedValue(JSON.stringify(existing));
      expect(await getFavoritesCountRedis(42)).toBe(2);
    });

    it("swallows errors and returns 0 for count", async () => {
      mockClient.get.mockRejectedValue(new Error("boom"));
      expect(await getFavoritesCountRedis(42)).toBe(0);
    });
  });
});

describe("experimental users (Set-backed)", () => {
  describe("getExperimentalUsersRedis", () => {
    it("reads sMembers of experimental_users and maps to numbers", async () => {
      mockClient.sMembers.mockResolvedValue(["1", "2", "3"]);
      const result = await getExperimentalUsersRedis();
      expect(mockClient.sMembers).toHaveBeenCalledWith("experimental_users");
      expect(result).toEqual([1, 2, 3]);
    });

    it("filters out non-numeric members", async () => {
      mockClient.sMembers.mockResolvedValue(["1", "not-a-number", "3"]);
      const result = await getExperimentalUsersRedis();
      expect(result).toEqual([1, 3]);
    });

    it("returns an empty array on error", async () => {
      mockClient.sMembers.mockRejectedValue(new Error("boom"));
      const result = await getExperimentalUsersRedis();
      expect(result).toEqual([]);
    });
  });

  describe("addExperimentalUserRedis", () => {
    it("returns true when sAdd reports 1 (added)", async () => {
      mockClient.sAdd.mockResolvedValue(1);
      const result = await addExperimentalUserRedis(42);
      expect(mockClient.sAdd).toHaveBeenCalledWith("experimental_users", "42");
      expect(result).toBe(true);
    });

    it("returns false when sAdd reports 0 (already exists)", async () => {
      mockClient.sAdd.mockResolvedValue(0);
      expect(await addExperimentalUserRedis(42)).toBe(false);
    });

    it("returns false on error", async () => {
      mockClient.sAdd.mockRejectedValue(new Error("boom"));
      expect(await addExperimentalUserRedis(42)).toBe(false);
    });
  });

  describe("removeExperimentalUserRedis", () => {
    it("returns true when sRem reports 1 (removed)", async () => {
      mockClient.sRem.mockResolvedValue(1);
      const result = await removeExperimentalUserRedis(42);
      expect(mockClient.sRem).toHaveBeenCalledWith("experimental_users", "42");
      expect(result).toBe(true);
    });

    it("returns false when sRem reports 0 (didn't exist)", async () => {
      mockClient.sRem.mockResolvedValue(0);
      expect(await removeExperimentalUserRedis(42)).toBe(false);
    });

    it("returns false on error", async () => {
      mockClient.sRem.mockRejectedValue(new Error("boom"));
      expect(await removeExperimentalUserRedis(42)).toBe(false);
    });
  });

  describe("isExperimentalUserRedis", () => {
    it("returns true when sIsMember reports 1", async () => {
      mockClient.sIsMember.mockResolvedValue(1);
      const result = await isExperimentalUserRedis(42);
      expect(mockClient.sIsMember).toHaveBeenCalledWith("experimental_users", "42");
      expect(result).toBe(true);
    });

    it("returns false when sIsMember reports 0", async () => {
      mockClient.sIsMember.mockResolvedValue(0);
      expect(await isExperimentalUserRedis(42)).toBe(false);
    });

    it("returns false on error", async () => {
      mockClient.sIsMember.mockRejectedValue(new Error("boom"));
      expect(await isExperimentalUserRedis(42)).toBe(false);
    });
  });
});
