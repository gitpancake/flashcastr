import { BaseApi } from "./base";

export interface FlashUser {
  fid: number;
  pfp_url: string;
  username: string;
}

export interface FlashData {
  flash_id: number;
  player: string;
  city: string;
  timestamp: number;
  img: string;
}

export interface FlashResponse {
  user_fid: number;
  user_pfp_url: string;
  user_username: string;
  flash: FlashData;
  cast_hash: string;
}

export interface FlashStats {
  cities: string[];
  flashCount: number;
}

export class FlashesApi extends BaseApi {
  public async getFlashes(page: number = 1, limit: number = 40, fid?: number, search?: string): Promise<FlashResponse[]> {
    const variables: Record<string, number | string | undefined> = {
      page,
      limit,
    };

    // Only include fid and search in variables if they are defined
    if (fid !== undefined && fid !== null) {
      variables.fid = fid;
    }
    if (search !== undefined && search !== null) {
      variables.username = search;
    }

    const response = await this.api.post("/graphql", {
      query: `
        query Flashes($page: Int!, $limit: Int!, $fid: Int, $username: String) {
          flashes(page: $page, limit: $limit, fid: $fid, username: $username) {
              user_fid
              user_pfp_url
              user_username
              flash {
                city
                flash_id
                player
                city
                timestamp
                img
              }
              cast_hash
          }
        }
      `,
      variables,
    });

    return response.data.data.flashes;
  }

  public async getFlashStats(fid?: number): Promise<FlashStats> {
    if (!fid) {
      return {
        cities: [],
        flashCount: 0,
      };
    }

    const response = await this.api.post("/graphql", {
      query: `
        query FlashStats($fid: Int!) {
          flashesSummary(fid: $fid) {
            cities
            flashCount
          }
        }
      `,
      variables: {
        fid,
      },
    });

    return response.data.data.flashesSummary;
  }

  public async getAllPlayers(username?: string): Promise<string[]> {
    const variables: Record<string, string | undefined> = {};
    if (username) {
      variables.username = username;
    }

    const response = await this.api.post("/graphql", {
      query: `
        query AllFlashesPlayers($username: String) {
          allFlashesPlayers(username: $username)
        }
      `,
      variables,
    });

    return response.data.data.allFlashesPlayers || [];
  }

  public async getFlashById(flashId: number | string): Promise<FlashResponse | null> {
    // Since there's no individual flash endpoint, we'll fetch recent flashes and find the one we need
    // This is not ideal but works as a fallback
    try {
      const allFlashes = await this.getFlashes(1, 100); // Get more flashes to increase chance of finding it
      const targetFlashId = Number(flashId);
      
      // Find the flash with matching ID
      const flash = allFlashes.find(f => f.flash.flash_id === targetFlashId);
      
      return flash ?? null;
    } catch (error) {
      console.error('Error fetching flash by ID:', error);
      return null;
    }
  }
}
