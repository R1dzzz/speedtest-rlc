import { z } from "zod";
import { insertSpeedTestSchema, speedTests } from "./schema";

export const api = {
  speedtest: {
    record: {
      method: 'POST' as const,
      path: '/api/speedtest/record' as const,
      input: insertSpeedTestSchema,
      responses: {
        201: z.custom<typeof speedTests.$inferSelect>(),
      }
    },
    history: {
      method: 'GET' as const,
      path: '/api/speedtest/history' as const,
      responses: {
        200: z.array(z.custom<typeof speedTests.$inferSelect>()),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
