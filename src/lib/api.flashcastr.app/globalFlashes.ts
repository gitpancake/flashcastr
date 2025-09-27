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
      // Search through globalFlashes to find our specific flash_id
      const response = await this.api.post("/graphql", {
        query: `
          query GlobalFlashes($page: Int, $limit: Int) {
            globalFlashes(page: $page, limit: $limit) {
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
        variables: { page: 1, limit: 100 },
      });

      const flashes = response.data.data.globalFlashes || [];
      const targetFlash = flashes.find((item: GlobalFlashApiResponse) =>
        parseInt(item.flash_id, 10) === flash_id
      );

      if (!targetFlash) {
        // Try searching more pages if not found in first 100
        for (let page = 2; page <= 10; page++) {
          const pageResponse = await this.api.post("/graphql", {
            query: `
              query GlobalFlashes($page: Int, $limit: Int) {
                globalFlashes(page: $page, limit: $limit) {
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
            variables: { page, limit: 100 },
          });

          const pageFlashes = pageResponse.data.data.globalFlashes || [];
          if (pageFlashes.length === 0) break;

          const found = pageFlashes.find((item: GlobalFlashApiResponse) =>
            parseInt(item.flash_id, 10) === flash_id
          );
          if (found) {
            return {
              flash_id: parseInt(found.flash_id, 10),
              city: found.city,
              player: found.player,
              img: found.img,
              ipfs_cid: found.ipfs_cid,
              text: found.text,
              timestamp: parseInt(found.timestamp, 10),
            };
          }
        }
        return null;
      }

      return {
        flash_id: parseInt(targetFlash.flash_id, 10),
        city: targetFlash.city,
        player: targetFlash.player,
        img: targetFlash.img,
        ipfs_cid: targetFlash.ipfs_cid,
        text: targetFlash.text,
        timestamp: parseInt(targetFlash.timestamp, 10),
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