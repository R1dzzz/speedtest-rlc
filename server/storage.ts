import { db } from "./db";
import { speedTests, type InsertSpeedTest, type SpeedTest } from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  createSpeedTest(test: InsertSpeedTest): Promise<SpeedTest>;
  getSpeedTests(): Promise<SpeedTest[]>;
}

export class DatabaseStorage implements IStorage {
  async createSpeedTest(test: InsertSpeedTest): Promise<SpeedTest> {
    const [result] = await db.insert(speedTests).values(test).returning();
    return result;
  }

  async getSpeedTests(): Promise<SpeedTest[]> {
    return await db.select().from(speedTests).orderBy(desc(speedTests.createdAt));
  }
}

export const storage = new DatabaseStorage();
