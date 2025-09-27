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
          query FlashesByCity($city: String, $page: Int, $limit: Int) {
            flashes(city: $city, page: $page, limit: $limit) {
              flash {
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
          }
        `,
        variables,
      });

      const flashes = response.data.data.flashes || [];

      // Transform to match expected interface
      const items: GlobalFlash[] = flashes.map((item: { flash: GlobalFlash }) => ({
        flash_id: item.flash.flash_id,
        city: item.flash.city,
        player: item.flash.player,
        img: item.flash.img,
        ipfs_cid: item.flash.ipfs_cid,
        text: item.flash.text,
        timestamp: item.flash.timestamp,
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
      const response = await this.api.post("/graphql", {
        query: `
          query Flash($flash_id: Int!) {
            flash(flash_id: $flash_id) {
              flash {
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
          }
        `,
        variables: { flash_id },
      });

      const flashData = response.data.data.flash?.flash;
      if (!flashData) return null;

      return {
        flash_id: flashData.flash_id,
        city: flashData.city,
        player: flashData.player,
        img: flashData.img,
        ipfs_cid: flashData.ipfs_cid,
        text: flashData.text,
        timestamp: flashData.timestamp,
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