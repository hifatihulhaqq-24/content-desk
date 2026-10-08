import type {
  AccountAnalyticsData,
  AccountSummary,
  DateRangeQuery,
} from "@/types/analytics";
import { findAccount, PLATFORM_MAP } from "@/config/platforms";
import {
  aggregateRange,
  buildKpis,
  buildTrend,
  rangesFromQuery,
} from "./aggregate";
import { computeAudience, toAccountSummary } from "./accounts";
import { contentBreakdown } from "./compute-platform";
import { postsInRange } from "./posts";

export function computeAccountSummaries(
  platformId: string,
  query: DateRangeQuery
): AccountSummary[] {
  const config = PLATFORM_MAP[platformId as keyof typeof PLATFORM_MAP];
  if (!config) return [];
  const { current } = rangesFromQuery(query);
  return config.accounts.map((account) => {
    const aggregate = aggregateRange([account.id], current);
    return toAccountSummary(account.id, aggregate);
  }) as AccountSummary[];
}

export function computeAccountAnalytics(
  accountId: string,
  query: DateRangeQuery
): AccountAnalyticsData | null {
  const found = findAccount(accountId);
  if (!found) return null;
  const { platform } = found;
  const { current, previous } = rangesFromQuery(query);
  const currentAgg = aggregateRange([accountId], current);
  const previousAgg = aggregateRange([accountId], previous);
  const summary = toAccountSummary(accountId, currentAgg);
  if (!summary) return null;

  const posts = postsInRange([accountId], query.from, query.to);

  return {
    account: summary,
    kpis: buildKpis(platform.kpis, currentAgg, previousAgg),
    trend: buildTrend(platform.trendMetrics, currentAgg, previousAgg),
    contentOverview: contentBreakdown(posts),
    audience: computeAudience(accountId),
  };
}
