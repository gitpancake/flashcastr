import axios from "axios";

// Match the invaders.fun Flash interface
export interface GlobalFlash {
  img: string;
  city: string;
  text: string;
  player: string;
  flash_id: number;
  timestamp: number;
}

export interface GlobalFlashResponse {
  items: GlobalFlash[];
  hasNext: boolean;
}

export class InvadersFunApi {
  private api = axios.create({
    baseURL: "https://api.invaders.fun",
    headers: {
      "Content-Type": "application/json",
    },
  });

  public async getGlobalFlashes(
    offset: number = 0, 
    limit: number = 40, 
    city?: string | null
  ): Promise<GlobalFlashResponse> {
    try {
      const query = `
        query GetFlashes($offset: Int, $limit: Int, $city: String) {
          flashes(offset: $offset, limit: $limit, city: $city) {
            items {
              city
              flash_id
              img
              player
              text
              timestamp
            }
            hasNext
          }
        }
      `;

      const variables: Record<string, unknown> = {
        offset,
        limit,
      };

      if (city) variables.city = city;

      const response = await this.api.post<{ 
        data: { 
          flashes: { 
            items: GlobalFlash[]; 
            hasNext: boolean 
          } 
        } 
      }>("/graphql", {
        query,
        variables,
      });

      return response.data.data.flashes;
    } catch (error) {
      console.error("Error fetching global flashes:", error);
      return { items: [], hasNext: false };
    }
  }

  public async getGlobalCities(): Promise<string[]> {
    try {
      const response = await this.api.post<{ data: { cities: string[] } }>("/graphql", {
        query: `query GetCities { cities }`,
      });

      return response.data.data.cities;
    } catch (error) {
      console.error("Error fetching cities:", error);
      return [];
    }
  }

  public async getGlobalFlash(flash_id: number): Promise<GlobalFlash | null> {
    try {
      const query = `
        query GetFlash($flash_id: Int!) {
          flash(flash_id: $flash_id) {
            img
            city
            text
            player
            flash_id
            timestamp
          }
        }
      `;

      const response = await this.api.post<{ data: { flash: GlobalFlash } }>("/graphql", {
        query,
        variables: { flash_id },
      });

      return response.data.data.flash;
    } catch (error) {
      console.error("Error fetching global flash:", error);
      return null;
    }
  }

  // Get trending cities (excluding Paris as requested)
  public async getTrendingCities(excludeParis: boolean = true): Promise<{city: string, count: number}[]> {
    try {
      // This would need to be implemented on the invaders.fun API
      // For now, return mock trending data
      const cities = await this.getGlobalCities();
      const filtered = excludeParis ? cities.filter(city => city.toLowerCase() !== 'paris') : cities;
      
      // Mock trending data - in real implementation this would come from API
      return filtered.slice(0, 10).map((city) => ({
        city,
        count: Math.floor(Math.random() * 100) + 10
      })).sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error("Error fetching trending cities:", error);
      return [];
    }
  }
}