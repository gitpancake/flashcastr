import { FrameNotificationDetails } from "@farcaster/frame-sdk";
import { Redis } from "@upstash/redis";

interface NotificationStore {
  get(key: string): Promise<FrameNotificationDetails | null>;
  set(key: string, notificationDetails: FrameNotificationDetails): Promise<void>;
  delete(key: string): Promise<void>;
}

class RedisNotificationStore implements NotificationStore {
  private readonly redis: Redis;

  constructor(url: string, token: string) {
    this.redis = new Redis({ url, token });
  }

  async get(key: string): Promise<FrameNotificationDetails | null> {
    return await this.redis.get<FrameNotificationDetails>(key);
  }

  async set(key: string, notificationDetails: FrameNotificationDetails): Promise<void> {
    await this.redis.set(key, notificationDetails);
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

class InMemoryNotificationStore implements NotificationStore {
  private readonly store = new Map<string, FrameNotificationDetails>();

  async get(key: string): Promise<FrameNotificationDetails | null> {
    return this.store.get(key) ?? null;
  }

  async set(key: string, notificationDetails: FrameNotificationDetails): Promise<void> {
    this.store.set(key, notificationDetails);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

function createNotificationStore(): NotificationStore {
  const { KV_REST_API_URL, KV_REST_API_TOKEN } = process.env;
  if (KV_REST_API_URL && KV_REST_API_TOKEN) {
    return new RedisNotificationStore(KV_REST_API_URL, KV_REST_API_TOKEN);
  }
  return new InMemoryNotificationStore();
}

const notificationStore = createNotificationStore();

function getUserNotificationDetailsKey(fid: number): string {
  return `${process.env.NEXT_PUBLIC_FRAME_NAME}:user:${fid}`;
}

export async function getUserNotificationDetails(fid: number): Promise<FrameNotificationDetails | null> {
  return await notificationStore.get(getUserNotificationDetailsKey(fid));
}

export async function setUserNotificationDetails(fid: number, notificationDetails: FrameNotificationDetails): Promise<void> {
  await notificationStore.set(getUserNotificationDetailsKey(fid), notificationDetails);
}

export async function deleteUserNotificationDetails(fid: number): Promise<void> {
  await notificationStore.delete(getUserNotificationDetailsKey(fid));
}
