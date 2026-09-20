export const LOCAL_STORAGE_KEYS = {
  FARCASTER_FID: "farcasterFid",
};

export const FETCH = {
  INITIAL_PAGE: 1,
  THRESHOLD: 15,
  LIMIT: 20,
};

export const FEATURES = {
  // Map tab access via environment variable (NEXT_PUBLIC_ prefix for client-side access)
  ADMIN_FID: process.env.NEXT_PUBLIC_ADMIN_FID ? parseInt(process.env.NEXT_PUBLIC_ADMIN_FID) : null,
};
