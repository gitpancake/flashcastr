import { BaseApi } from "./base";

// Match the existing GlobalFlash interface for compatibility
export interface GlobalFlash {
  img: string;
  city: string;
  text: string;
  player: string;
  flash_id: number;
  timestamp: number;
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

interface FlashcastrFlashResponse {
  flash_id: string;
  flash: {
    flash_id: string;
    city: string;
    player: string;
    img: string;
    ipfs_cid?: string;
    text?: string;
    timestamp: string;
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

      const response = await this.api.post("/graphql", {
        query: `
          query GlobalFlashes($city: String, $player: String, $page: Int, $limit: Int) {
            globalFlashes(city: $city, player: $player, page: $page, limit: $limit) {
              flash_id
              city
              player
              img
              ipfs_cid
              text
              timestamp
              flash_count
            }
          }
        `,
        variables,
      });

      const flashes = response.data.data.globalFlashes || [];

      // Transform to match expected interface - using direct globalFlashes structure
      const items: GlobalFlash[] = flashes.map((item: GlobalFlashApiResponse) => ({
        flash_id: parseInt(item.flash_id, 10),
        city: item.city,
        player: item.player,
        img: item.img,
        ipfs_cid: item.ipfs_cid,
        text: item.text,
        timestamp: parseInt(item.timestamp, 10),
      }));

      // For now, we'll assume there are more pages if we got a full page
      // This is a simplification - in a real implementation you might want
      // to add pagination info to the GraphQL response
      const hasNext = items.length === limit;

      return { items, hasNext };
    } catch (error) {
      console.error("Error fetching global flashes:", error);
      return { items: [], hasNext: false };
    }
  }

  public async getGlobalCities(): Promise<string[]> {
    try {
      const response = await this.api.post("/graphql", {
        query: `
          query GetAllCities {
            getAllCities
          }
        `,
      });

      return response.data.data.getAllCities || [];
    } catch (error) {
      console.error("Error fetching cities:", error);
      return [];
    }
  }

  public async getGlobalFlash(flash_id: number): Promise<GlobalFlash | null> {
    try {
      // Use direct query by flash_id for efficient lookup
      console.log(`Flash ${flash_id}: Querying globalFlash directly...`);

      const response = await this.api.post("/graphql", {
        query: `
          query GlobalFlash($flash_id: String!) {
            globalFlash(flash_id: $flash_id) {
              flash_id
              city
              player
              img
              ipfs_cid
              text
              timestamp
            }
          }
        `,
        variables: { flash_id: flash_id.toString() },
      });

      const flash = response.data.data.globalFlash;

      if (!flash) {
        console.log(`Flash ${flash_id}: Not found in globalFlash query`);
        return null;
      }

      console.log(`Flash ${flash_id}: Found in globalFlash query`);
      return {
        flash_id: parseInt(flash.flash_id, 10),
        city: flash.city,
        player: flash.player,
        img: flash.img,
        ipfs_cid: flash.ipfs_cid,
        text: flash.text,
        timestamp: parseInt(flash.timestamp, 10),
      };
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
      const response = await this.api.post("/graphql", {
        query: `
          query GetTrendingCities($excludeParis: Boolean, $hours: Int) {
            getTrendingCities(excludeParis: $excludeParis, hours: $hours) {
              city
              count
            }
          }
        `,
        variables: { excludeParis, hours },
      });

      return response.data.data.getTrendingCities || [];
    } catch (error) {
      console.error("Error fetching trending cities:", error);
      return [];
    }
  }
}