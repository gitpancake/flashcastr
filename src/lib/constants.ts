export const LOCAL_STORAGE_KEYS = {
  FARCASTER_FID: "farcasterFid",
};

export const FETCH = {
  INITIAL_PAGE: 1,
  THRESHOLD: 15,
  LIMIT: 20,
};

export const S3 = {
  BASE_URL: process.env.NEXT_PUBLIC_S3_BASE || "https://invader-flashes.s3.amazonaws.com",
};

export const IPFS = {
  GATEWAY: process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://fuchsia-rich-lungfish-648.mypinata.cloud/ipfs",
};
