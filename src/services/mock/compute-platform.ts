import type {
  ContentBreakdownItem,
  DateRangeQuery,
  PlatformAnalyticsData,
  Post,
} from "@/types/analytics";
import { PLATFORM_MAP, type PlatformId } from "@/config/platforms";
import {
  aggregateRange,
  buildKpis,
  buildTrend,
  rangesFromQuery,
} from "./aggregate";
import { postsInRange } from "./posts";

function engagementScore(post: Post): number {
  const m = post.metrics;
  return m.likes + m.comments + m.shares + m.saves;
}

export function contentBreakdown(posts: Post[]): ContentBreakdownItem[] {
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    const list = groups.get(post.type) ?? [];
    list.push(post);
    groups.set(post.type, list);
  }
  return [...groups.entries()].map(([label, items]) => ({
    label,
    count: items.length,
    avgEngagement:
      Math.round(
        (items.reduce((sum, p) => sum + p.metrics.engagementRate, 0) /
          items.length) *
          10
      ) / 10,
  }));
}

export function computePlatformAnalytics(
  platformId: PlatformId,
  query: DateRangeQuery
): PlatformAnalyticsData {
  const config = PLATFORM_MAP[platformId];
  const accountIds = config.accounts.map((a) => a.id);
  const { current, previous } = rangesFromQuery(query);
  const currentAgg = aggregateRange(accountIds, current);
  const previousAgg = aggregateRange(accountIds, previous);

  const posts = postsInRange(accountIds, query.from, query.to);
  const topPosts = [...posts]
    .sort((a, b) => engagementScore(b) - engagementScore(a))
    .slice(0, 8);

  return {
    platform: platformId,
    kpis: buildKpis(config.kpis, currentAgg, previousAgg),
    trend: buildTrend(config.trendMetrics, currentAgg, previousAgg),
    contentTypeBreakdown: contentBreakdown(posts),
    topPosts,
  };
}
