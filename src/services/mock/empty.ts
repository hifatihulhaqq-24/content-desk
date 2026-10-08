import type {
  AccountAnalyticsData,
  AccountSummary,
  KpiMetric,
  OverviewData,
  Paged,
  PlatformAnalyticsData,
  PublishingTimeData,
} from "@/types/analytics";
import { getMetric } from "@/config/metrics";
import { PLATFORM_MAP, findAccount, type PlatformId } from "@/config/platforms";
import { toAccountSummary } from "./accounts";
import { OVERVIEW_KPIS } from "./compute-overview";
import { zeroHourPoints } from "./publishing-time";
import { WEB_KPIS } from "./web";
import { aggregateRange } from "./aggregate";

export function zeroKpis(
  keys: { key: string; label?: string }[]
): KpiMetric[] {
  return keys.map(({ key, label }) => {
    const metric = getMetric(key);
    return {
      key,
      label: label ?? metric.label,
      value: 0,
      previousValue: null,
      deltaPercent: null,
      format: metric.format,
    };
  });
}

const EMPTY_RANGE = { from: new Date(0), to: new Date(0) };

export function emptyOverview(): OverviewData {
  return {
    kpis: zeroKpis(OVERVIEW_KPIS),
    trend: { points: [], previous: [] },
    comparison: [],
    platformSummaries: [],
    contentBuckets: [],
    webStats: { kpis: zeroKpis(WEB_KPIS), points: [] },
    topArticles: [],
    topicRecommendations: [],
  };
}

export function emptyPlatformAnalytics(
  platform: PlatformId
): PlatformAnalyticsData {
  const config = PLATFORM_MAP[platform];
  return {
    platform,
    kpis: zeroKpis(config.kpis),
    trend: { points: [], previous: [] },
    contentTypeBreakdown: [],
    topPosts: [],
  };
}

export function emptyAccountAnalytics(
  accountId: string
): AccountAnalyticsData | null {
  const found = findAccount(accountId);
  if (!found) return null;
  const zeroAggregate = aggregateRange([], EMPTY_RANGE);
  const summary = toAccountSummary(accountId, zeroAggregate);
  if (!summary) return null;
  return {
    account: summary,
    kpis: zeroKpis(found.platform.kpis),
    trend: { points: [], previous: [] },
    contentOverview: [],
    audience: { genders: [], ageRanges: [], locations: [] },
  };
}

export function emptySummaries(platform: PlatformId): AccountSummary[] {
  const config = PLATFORM_MAP[platform];
  const zeroAggregate = aggregateRange([], EMPTY_RANGE);
  return config.accounts.map(
    (account) =>
      toAccountSummary(account.id, zeroAggregate) as AccountSummary
  );
}

export function emptyPosts(page: number, pageSize: number): Paged<never> {
  return { items: [], total: 0, page, pageSize };
}

export function emptyPublishingTime(): PublishingTimeData {
  return {
    points: zeroHourPoints(),
    totals: { content: 0, views: 0, engagements: 0 },
  };
}

export { zeroContentType as emptyContentType } from "./content-type";
export { zeroBuildingBlock as emptyBuildingBlock } from "./building-block";
