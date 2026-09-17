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
  pfp_url: string | null;
  flash_count: number;
  city_count: number;
}

export interface DailyProgress {
  date: string;
  count: number;
}

export interface FlashIdentification {
  id: number;
  matched_flash_id: string;
  matched_flash_name: string | null;
  similarity: number;
  confidence: number;
}

const FLASH_NESTED_FIELDS = `
  flash_id
  city
  player
  timestamp
  img
  ipfs_cid
`;

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

    const data = await this.graphql<{ flashes: FlashResponse[] }>(
      `
        query Flashes($page: Int!, $limit: Int!, $fid: Int, $username: String) {
          flashes(page: $page, limit: $limit, fid: $fid, username: $username) {
              user_fid
              user_pfp_url
              user_username
              flash {
                ${FLASH_NESTED_FIELDS}
              }
              cast_hash
          }
        }
      `,
      variables
    );

    return data.flashes;
  }

  public async getFlashStats(fid?: number): Promise<FlashStats> {
    if (!fid) {
      return {
        cities: [],
        flashCount: 0,
      };
    }

    const data = await this.graphql<{ flashesSummary: FlashStats }>(
      `
        query FlashStats($fid: Int!) {
          flashesSummary(fid: $fid) {
            cities
            flashCount
          }
        }
      `,
      { fid }
    );

    return data.flashesSummary;
  }

  public async getAllPlayers(username?: string): Promise<string[]> {
    const variables: Record<string, string | undefined> = {};
    if (username) {
      variables.username = username;
    }

    const data = await this.graphql<{ allFlashesPlayers: string[] }>(
      `
        query AllFlashesPlayers($username: String) {
          allFlashesPlayers(username: $username)
        }
      `,
      variables
    );

    return data.allFlashesPlayers || [];
  }

  public async getFlashById(flashId: number | string): Promise<FlashResponse | null> {
    const data = await this.graphql<{ flash: FlashResponse | null }>(
      `
        query Flash($flash_id: Int!) {
          flash(flash_id: $flash_id) {
            user_fid
            user_pfp_url
            user_username
            flash {
              ${FLASH_NESTED_FIELDS}
            }
            cast_hash
          }
        }
      `,
      { flash_id: Number(flashId) }
    );

    return data.flash ?? null;
  }

  public async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    const data = await this.graphql<{ getLeaderboard: LeaderboardEntry[] }>(
      `
        query GetLeaderboard($limit: Int) {
          getLeaderboard(limit: $limit) {
            username
            pfp_url
            flash_count
            city_count
          }
        }
      `,
      { limit }
    );

    return data.getLeaderboard || [];
  }

  public async getProgress(fid: number, days: number = 7, order: 'ASC' | 'DESC' = 'ASC'): Promise<DailyProgress[]> {
    try {
      const data = await this.graphql<{ progress: DailyProgress[] }>(
        `
          query GetProgress($fid: Int!, $days: Int!, $order: String) {
            progress(fid: $fid, days: $days, order: $order) {
              date
              count
            }
          }
        `,
        { fid, days, order }
      );

      return data?.progress || [];
    } catch (error) {
      console.error('getProgress error:', error);
      throw error;
    }
  }

  public async saveFlashIdentification(
    sourceIpfsCid: string,
    matchedFlashId: string,
    matchedFlashName: string | null,
    similarity: number,
    confidence: number
  ): Promise<FlashIdentification> {
    const data = await this.graphql<{ saveFlashIdentification: FlashIdentification }>(
      `
        mutation SaveFlashIdentification($source_ipfs_cid: String!, $matched_flash_id: String!, $matched_flash_name: String, $similarity: Float!, $confidence: Float!) {
          saveFlashIdentification(source_ipfs_cid: $source_ipfs_cid, matched_flash_id: $matched_flash_id, matched_flash_name: $matched_flash_name, similarity: $similarity, confidence: $confidence) {
            id
            matched_flash_id
            matched_flash_name
            similarity
            confidence
          }
        }
      `,
      {
        source_ipfs_cid: sourceIpfsCid,
        matched_flash_id: matchedFlashId,
        matched_flash_name: matchedFlashName,
        similarity,
        confidence,
      }
    );

    return data.saveFlashIdentification;
  }
}
