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

  // Get trending cities based on flash count in the last 6 hours
  public async getTrendingCities(excludeParis: boolean = true): Promise<{city: string, count: number}[]> {
    try {
      // Calculate timestamp for 6 hours ago
      const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);
      
      // Fetch recent flashes (we'll get enough to cover 6 hours of activity)
      // Start with 500 flashes, if we need more we can increase this
      const response = await this.getGlobalFlashes(0, 500);
      
      // Filter flashes from the last 6 hours and count by city
      const cityCounts = new Map<string, number>();
      
      for (const flash of response.items) {
        // Skip if flash is older than 6 hours
        if (flash.timestamp < sixHoursAgo) {
          continue;
        }
        
        const city = flash.city;
        
        // Skip Paris if requested
        if (excludeParis && city.toLowerCase() === 'paris') {
          continue;
        }
        
        cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
      }
      
      // Convert to array and sort by count
      const trendingCities = Array.from(cityCounts.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Return top 10
      
      return trendingCities;
    } catch (error) {
      console.error("Error fetching trending cities:", error);
      return [];
    }
  }
}