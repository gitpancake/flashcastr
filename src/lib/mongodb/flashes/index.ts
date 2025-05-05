import { Collection, Filter, UpdateFilter } from "mongodb";
import { Mongo } from "../connector";
import { Flash } from "./types";

export class Flashes extends Mongo<Flash> {
  constructor() {
    super({
      dbName: "invaders",
      collectionName: "flashes",
    });
  }

  public async onConnect(): Promise<void> {
    await this.collection.createIndex({ timestamp: -1 });
  }

  public async get(filter: Partial<Flash>): Promise<Flash | null> {
    return this.execute(async (collection) => await collection.findOne(filter));
  }

  public async getMany(filter: Filter<Flash>, page: number = 1, limit: number = 10): Promise<Flash[]> {
    const skip = (page - 1) * limit;
    return this.execute(async (collection) => await collection.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).toArray());
  }

  public async getAllCities(): Promise<string[]> {
    return this.execute(async (collection) => {
      const cities = await collection.distinct("city"); // Fetch unique city names
      return cities.sort((a, b) => a.localeCompare(b)); // Sort alphabetically
    });
  }

  public async updateDocument(filter: Partial<Flash>, update: UpdateFilter<Flash>): Promise<void> {
    return this.execute(async (collection: Collection<Flash>) => {
      const result = await collection.updateOne(filter, update);
      if (result.matchedCount === 0) {
        throw new Error("No document found matching the filter criteria");
      }
    });
  }

  public async getRecentFlashes(page: number = 1, limit: number = 10): Promise<Flash[]> {
    const skip = (page - 1) * limit;

    return this.execute(async (collection: Collection<Flash>) => {
      return await collection.find({}).sort({ timestamp: -1 }).skip(skip).limit(limit).toArray();
    });
  }
}
