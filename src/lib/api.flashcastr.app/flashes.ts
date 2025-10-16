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
  ipfs_cid?: string;
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

export interface LeaderboardEntry {
  username: string;
  flash_count: number;
  city_count: number;
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
                ipfs_cid
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
    const response = await this.api.post("/graphql", {
      query: `
        query Flash($flash_id: Int!) {
          flash(flash_id: $flash_id) {
            user_fid
            user_pfp_url
            user_username
            flash {
              city
              flash_id
              player
              timestamp
              img
              ipfs_cid
            }
            cast_hash
          }
        }
      `,
      variables: { flash_id: Number(flashId) },
    });

    return response.data.data.flash ?? null;
  }

  public async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    const response = await this.api.post("/graphql", {
      query: `
        query GetLeaderboard($limit: Int) {
          getLeaderboard(limit: $limit) {
            username
            flash_count
            city_count
          }
        }
      `,
      variables: { limit },
    });

    return response.data.data.getLeaderboard || [];
  }
}
