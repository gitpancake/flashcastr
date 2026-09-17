export const queryKeys = {
  user: (fid?: number) => (fid === undefined ? ["user"] : ["user", fid]),
  userFlashes: (fid?: number) => ["flashes", fid],
  userFlashesFeed: (fid?: number) => ["flashes", "feed", fid],
  flashStats: (fid?: number) => ["flashStats", fid],
  leaderboard: (limit?: number) => ["leaderboard", limit],
  progress: (fid?: number, days?: number, order?: "ASC" | "DESC") => [
    "progress",
    fid,
    days,
    order,
  ],
  globalFlashes: (city?: string) => ["global-flashes", city],
};
