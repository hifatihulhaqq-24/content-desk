import type { AnalyticsService } from "./analytics-service";
import { MockAnalyticsService } from "./mock/mock-analytics-service";
import { HttpAnalyticsService } from "./http/http-analytics-service";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

let instance: AnalyticsService | null = null;

export function getAnalyticsService(): AnalyticsService {
  if (!instance) {
    instance = useMock ? new MockAnalyticsService() : new HttpAnalyticsService();
  }
  return instance;
}

export type { AnalyticsService };
