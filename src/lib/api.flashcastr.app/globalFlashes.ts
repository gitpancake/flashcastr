import { BaseApi } from "./base";
import { parseTimestamp } from "../help/parseTimestamp";

// Match the existing GlobalFlash interface for compatibility
export interface GlobalFlash {
  img: string;
  city: string;
  text: string;
  player: string;
  flash_id: number;
  timestamp: number | null;
  ipfs_cid?: string;
}

export interface GlobalFlashResponse {
  items: GlobalFlash[];
  hasNext: boolean;
}

export interface TrendingCity {
  city: string;
  count: number;
}

interface GlobalFlashApiResponse {
  flash_id: string;
  city: string;
  player: string;
  img: string;
  ipfs_cid?: string;
  text: string;
  timestamp: string;
  flash_count?: string;
}

interface UnifiedFlashApiResponse {
  flash_id: string;
  city: string | null;
  player: string | null;
  img: string | null;
  ipfs_cid: string | null;
  text: string | null;
  timestamp: string;
  flash_count: string | null;
  farcaster_user: FarcasterUser | null;
  identification: FlashIdentificationInfo | null;
}
const FLASH_CORE_FIELDS = `
  flash_id
  city
  player
  img
  ipfs_cid
  text
  timestamp
  flash_count
`;

function mapGlobalFlashDto(item: GlobalFlashApiResponse): GlobalFlash {
  return {
    flash_id: parseInt(item.flash_id, 10),
    city: item.city,
    player: item.player,
    img: item.img,
    ipfs_cid: item.ipfs_cid,
    text: item.text,
    timestamp: parseTimestamp(item.timestamp),
  };
}

export class GlobalFlashesApi extends BaseApi {
  public async getGlobalFlashes(
    page: number = 1,
    limit: number = 40,
    city?: string | null
  ): Promise<GlobalFlashResponse> {
    try {
      const variables: Record<string, unknown> = {
        page,
        limit,
      };

      if (city) variables.city = city;

      const data = await this.graphql<{ globalFlashes: GlobalFlashApiResponse[] }>(
        `
          query GlobalFlashes($city: String, $player: String, $page: Int, $limit: Int) {
            globalFlashes(city: $city, player: $player, page: $page, limit: $limit) {
              ${FLASH_CORE_FIELDS}
            }
          }
        `,
        variables
      );

      const flashes = data.globalFlashes || [];

      // Transform to match expected interface - using direct globalFlashes structure
      const items: GlobalFlash[] = flashes.map(mapGlobalFlashDto);

      // For now, we'll assume there are more pages if we got a full page
      // This is a simplification - in a real implementation you might want
      // to add pagination info to the GraphQL response
      const hasNext = items.length === limit;

      return { items, hasNext };
    } catch (error) {
      console.error("Error fetching global flashes:", error);
      throw error;
    }
  }

  public async getGlobalCities(): Promise<string[]> {
    try {
      const data = await this.graphql<{ getAllCities: string[] }>(`
          query GetAllCities {
            getAllCities
          }
        `);

      return data.getAllCities || [];
    } catch (error) {
      console.error("Error fetching cities:", error);
      return [];
    }
  }

  public async getGlobalFlash(flash_id: number): Promise<GlobalFlash | null> {
    try {
      const data = await this.graphql<{ globalFlash: GlobalFlashApiResponse | null }>(
        `
          query GlobalFlash($flash_id: String!) {
            globalFlash(flash_id: $flash_id) {
              ${FLASH_CORE_FIELDS}
            }
          }
        `,
        { flash_id: flash_id.toString() }
      );

      if (!data.globalFlash) {
        return null;
      }

      return mapGlobalFlashDto(data.globalFlash);
    } catch (error) {
      console.error("Error fetching global flash:", error);
      return null;
    }
  }

  public async getTrendingCities(
    excludeParis: boolean = true,
    hours: number = 6
  ): Promise<TrendingCity[]> {
    try {
      const data = await this.graphql<{ getTrendingCities: TrendingCity[] }>(
        `
          query GetTrendingCities($excludeParis: Boolean, $hours: Int) {
            getTrendingCities(excludeParis: $excludeParis, hours: $hours) {
              city
              count
            }
          }
        `,
        { excludeParis, hours }
      );

      return data.getTrendingCities || [];
    } catch (error) {
      console.error("Error fetching trending cities:", error);
      return [];
    }
  }
}

export const globalFlashesApi = new GlobalFlashesApi();

// Unified Flash types that include Farcaster user and identification data
export interface FarcasterUser {
  fid: number;
  username: string | null;
  pfp_url: string | null;
  cast_hash: string | null;
}

export interface FlashIdentificationInfo {
  id: number;
  matched_flash_id: string;
  matched_flash_name: string | null;
  similarity: number;
  confidence: number;
}

export interface UnifiedFlash {
  flash_id: number;
  city: string | null;
  player: string | null;
  img: string | null;
  ipfs_cid: string | null;
  text: string | null;
  timestamp: number | null;
  flash_count: string | null;
  farcaster_user: FarcasterUser | null;
  identification: FlashIdentificationInfo | null;
}

const UNIFIED_EXTRA_FIELDS = `
  farcaster_user {
    fid
    username
    pfp_url
    cast_hash
  }
  identification {
    id
    matched_flash_id
    matched_flash_name
    similarity
    confidence
  }
`;

function mapUnifiedFlashDto(item: UnifiedFlashApiResponse): UnifiedFlash {
  return {
    flash_id: parseInt(item.flash_id, 10),
    city: item.city,
    player: item.player,
    img: item.img,
    ipfs_cid: item.ipfs_cid,
    text: item.text,
    timestamp: parseTimestamp(item.timestamp),
    flash_count: item.flash_count,
    farcaster_user: item.farcaster_user,
    identification: item.identification,
  };
}

export class UnifiedFlashesApi extends BaseApi {
  public async getUnifiedFlash(flash_id: number): Promise<UnifiedFlash | null> {
    try {
      const data = await this.graphql<{ unifiedFlash: UnifiedFlashApiResponse | null }>(
        `
          query UnifiedFlash($flash_id: String!) {
            unifiedFlash(flash_id: $flash_id) {
              ${FLASH_CORE_FIELDS}
              ${UNIFIED_EXTRA_FIELDS}
            }
          }
        `,
        { flash_id: flash_id.toString() }
      );

      if (!data.unifiedFlash) return null;

      return mapUnifiedFlashDto(data.unifiedFlash);
    } catch (error) {
      console.error("Error fetching unified flash:", error);
      return null;
    }
  }

  public async getUnifiedFlashes(
    page: number = 1,
    limit: number = 40,
    city?: string | null,
    player?: string | null
  ): Promise<{ items: UnifiedFlash[]; hasNext: boolean }> {
    try {
      const variables: Record<string, unknown> = { page, limit };
      if (city) variables.city = city;
      if (player) variables.player = player;

      const data = await this.graphql<{ unifiedFlashes: UnifiedFlashApiResponse[] }>(
        `
          query UnifiedFlashes($page: Int, $limit: Int, $city: String, $player: String) {
            unifiedFlashes(page: $page, limit: $limit, city: $city, player: $player) {
              ${FLASH_CORE_FIELDS}
              ${UNIFIED_EXTRA_FIELDS}
            }
          }
        `,
        variables
      );

      const flashes = data.unifiedFlashes || [];
      const items: UnifiedFlash[] = flashes.map(mapUnifiedFlashDto);

      return { items, hasNext: items.length === limit };
    } catch (error) {
      console.error("Error fetching unified flashes:", error);
      return { items: [], hasNext: false };
    }
  }
}

export const unifiedFlashesApi = new UnifiedFlashesApi();
