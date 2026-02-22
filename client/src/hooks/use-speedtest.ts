import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertSpeedTest } from "@shared/routes";

// Parse function to handle potential Zod validation errors gracefully during dev
function parseWithLogging<T>(schema: any, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    // In strict mode we'd throw, but returning raw data sometimes helps debug missing fields
    return data as T; 
  }
  return result.data;
}

export function useSpeedtestHistory() {
  return useQuery({
    queryKey: [api.speedtest.history.path],
    queryFn: async () => {
      const res = await fetch(api.speedtest.history.path, { credentials: "include" });
      if (!res.ok) {
        // If endpoint doesn't exist yet in dev, return empty array to prevent UI crash
        if (res.status === 404) return [];
        throw new Error('Failed to fetch history');
      }
      const data = await res.json();
      return parseWithLogging(api.speedtest.history.responses[200], data, "speedtest.history");
    },
  });
}

export function useRecordSpeedtest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertSpeedTest) => {
      const validated = api.speedtest.record.input.parse(data);
      const res = await fetch(api.speedtest.record.path, {
        method: api.speedtest.record.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        // Handle gracefully if endpoint missing
        if (res.status === 404) {
          console.warn('Record endpoint not found, simulating success for UI purposes');
          return validated;
        }
        throw new Error('Failed to record speedtest');
      }
      
      const responseData = await res.json();
      return parseWithLogging(api.speedtest.record.responses[201], responseData, "speedtest.record");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.speedtest.history.path] });
    },
  });
}
