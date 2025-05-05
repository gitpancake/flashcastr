import { User } from "@neynar/nodejs-sdk/build/api";

export enum MosaicStatus {
  DESTROYED = "destroyed",
  DEGRADED = "degraded",
  ALIVE = "alive",
  IDENTIFY = "identify",
}

export interface Contribution {
  mosaic_id?: string;
  status: MosaicStatus;
  timestamp: number;
  user: User;
}

export interface Flash {
  img: string;
  city: string;
  text: string;
  player: string;
  flash_id: number;
  timestamp: number;
  flash_count: string;
  posted: boolean;
  contributions: Contribution[];
}
