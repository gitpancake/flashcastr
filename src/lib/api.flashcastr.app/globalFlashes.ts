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

interface FlashResponse {
  id: string;
  flash_id: string;
  user_fid: number;
  user_username: string;
  user_pfp_url: string;
  cast_hash: string;
  flash: {
    flash_id: string;
    city: string;
    player: string;
    img: string;
    ipfs_cid?: string;
    text: string;
    timestamp: string;
    flash_count?: string;
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
          query FlashesByCity($city: String, $page: Int, $limit: Int) {
            flashes(city: $city, page: $page, limit: $limit) {
              id
              flash_id
              user_fid
              user_username
              user_pfp_url
              cast_hash
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

      // Transform to match expected interface - flash_id is a string in the API
      const items: GlobalFlash[] = flashes.map((item: FlashResponse) => ({
        flash_id: parseInt(item.flash.flash_id, 10),
        city: item.flash.city,
        player: item.flash.player,
        img: item.flash.img,
        ipfs_cid: item.flash.ipfs_cid,
        text: item.flash.text,
        timestamp: parseInt(item.flash.timestamp, 10),
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
      // Since individual flash query might not exist, let's search through flashes
      // We'll fetch a larger batch and look for our specific flash_id
      const response = await this.api.post("/graphql", {
        query: `
          query FlashesByCity($page: Int, $limit: Int) {
            flashes(page: $page, limit: $limit) {
              id
              flash_id
              user_fid
              user_username
              user_pfp_url
              cast_hash
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
        variables: { page: 1, limit: 100 },
      });

      const flashes = response.data.data.flashes || [];
      const targetFlash = flashes.find((item: FlashResponse) =>
        parseInt(item.flash.flash_id, 10) === flash_id
      );

      if (!targetFlash) {
        // Try searching more pages if not found in first 100
        for (let page = 2; page <= 10; page++) {
          const pageResponse = await this.api.post("/graphql", {
            query: `
              query FlashesByCity($page: Int, $limit: Int) {
                flashes(page: $page, limit: $limit) {
                  flash { flash_id city player img ipfs_cid text timestamp }
                }
              }
            `,
            variables: { page, limit: 100 },
          });

          const pageFlashes = pageResponse.data.data.flashes || [];
          if (pageFlashes.length === 0) break;

          const found = pageFlashes.find((item: FlashResponse) =>
            parseInt(item.flash.flash_id, 10) === flash_id
          );
          if (found) {
            return {
              flash_id: parseInt(found.flash.flash_id, 10),
              city: found.flash.city,
              player: found.flash.player,
              img: found.flash.img,
              ipfs_cid: found.flash.ipfs_cid,
              text: found.flash.text,
              timestamp: parseInt(found.flash.timestamp, 10),
            };
          }
        }
        return null;
      }

      return {
        flash_id: parseInt(targetFlash.flash.flash_id, 10),
        city: targetFlash.flash.city,
        player: targetFlash.flash.player,
        img: targetFlash.flash.img,
        ipfs_cid: targetFlash.flash.ipfs_cid,
        text: targetFlash.flash.text,
        timestamp: parseInt(targetFlash.flash.timestamp, 10),
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