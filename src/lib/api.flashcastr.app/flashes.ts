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
  user: FlashUser;
  flash: FlashData;
  castHash: string;
}

export interface FlashStats {
  cities: string[];
  flashCount: number;
}

export class FlashesApi extends BaseApi {
  public async getFlashes(page: number = 1, limit: number = 40, fid?: number, search?: string): Promise<FlashResponse[]> {
    const variables: Record<string, any> = {
      page,
      limit,
    };

    // Only include fid and search in variables if they are defined
    if (fid !== undefined && fid !== null) {
      variables.fid = fid;
    }
    if (search !== undefined && search !== null) {
      variables.search = search;
    }

    const response = await this.api.post("/graphql", {
      query: `
        query Flashes($page: Int!, $limit: Int!, $fid: Int, $search: String) {
          flashesAll(page: $page, limit: $limit, fid: $fid, search: $search) {
            user {
              fid
              pfp_url
              username
            },
            flash {
              flash_id
              player
              city
              timestamp
              img
            },
            castHash
          }
        }
      `,
      variables,
    });

    return response.data.data.flashesAll;
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
}
