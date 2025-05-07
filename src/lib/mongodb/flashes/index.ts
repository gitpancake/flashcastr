import { Filter, WithId } from "mongodb";
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

  public async getMany(filter: Filter<Flash>, page: number = 1, limit: number = 10): Promise<WithId<Flash>[]> {
    const skip = (page - 1) * limit;
    return this.execute(async (collection) => await collection.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).toArray());
  }
}
