import { pgTable, text, serial, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const speedTests = pgTable("speed_tests", {
  id: serial("id").primaryKey(),
  ping: real("ping").notNull(),
  jitter: real("jitter").notNull(),
  download: real("download").notNull(), // in Mbps
  upload: real("upload").notNull(),     // in Mbps
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSpeedTestSchema = createInsertSchema(speedTests).omit({ id: true, createdAt: true });

export type SpeedTest = typeof speedTests.$inferSelect;
export type InsertSpeedTest = z.infer<typeof insertSpeedTestSchema>;
