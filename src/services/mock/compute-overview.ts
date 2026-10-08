import type {
  ContentBucket,
  OverviewData,
  OverviewQuery,
  PlatformComparisonPoint,
  PlatformSummary,
  Post,
} from "@/types/analytics";
import { VISIBLE_PLATFORMS } from "@/config/platforms";
import { toIsoDate } from "@/lib/date";
import {
  buildKpis,
  buildTrend,
  rangesFromQuery,
  type RangeAggregate,
} from "./aggregate";
import { aggregatePosts, filterByCluster } from "./post-aggregate";
import { postsInRange } from "./posts";
import { topArticlesInRange } from "./articles";
import { computeWebStats } from "./web";
import { topicsForCluster } from "./topics";

export const OVERVIEW_KPIS = [
  { key: "views", label: "Total tayangan" },
  { key: "engagement", label: "Interaksi pembaca" },
  { key: "engagementRate", label: "Tingkat interaksi" },
  { key: "posts", label: "Jumlah konten" },
];

const OVERVIEW_TREND = [
  "reach",
  "impressions",
  "engagement",
  "views",
  "engagementRate",
  "posts",
];

const COMPARISON_METRICS = ["reach", "impressions", "engagement", "views"];

const BUCKET_LIMIT = 5;

const BUCKET_DEFS = [
  {
    key: "breakout" as const,
    label: "Breakout",
    description: "Konten dengan tayangan jauh di atas performa biasanya.",
  },
  {
    key: "growing" as const,
    label: "Masih Bertumbuh",
    description: "Konten yang mulai menarik perhatian pembaca.",
  },
  {
    key: "lowLight" as const,
    label: "Low Light",
    description: "Konten dengan performa rendah di minggu ini.",
  },
];

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function classifyBuckets(posts: Post[]): ContentBucket[] {
  const byViewsDesc = [...posts].sort(
    (a, b) => b.metrics.views - a.metrics.views
  );
  const views = byViewsDesc.map((post) => post.metrics.views);
  const med = median(views);

  let breakout: Post[] = [];
  let growing: Post[] = [];
  let lowLight: Post[] = [];

  if (posts.length >= 6) {
    breakout = byViewsDesc.filter((post) => post.metrics.views >= med * 2);
    growing = byViewsDesc.filter(
      (post) => post.metrics.views >= med && post.metrics.views < med * 2
    );
    lowLight = byViewsDesc
      .filter((post) => post.metrics.views < med * 0.5)
      .reverse();
  } else if (posts.length > 1) {
    const edge = Math.max(1, Math.ceil(posts.length / 3));
    breakout = byViewsDesc.slice(0, edge);
    growing = byViewsDesc.slice(edge, posts.length - edge);
    lowLight = byViewsDesc.slice(posts.length - edge).reverse();
  } else if (posts.length === 1) {
    breakout = byViewsDesc;
  }

  return BUCKET_DEFS.map((def) => ({
    ...def,
    medianViews: med,
    posts:
      def.key === "lowLight"
        ? lowLight.slice(0, BUCKET_LIMIT)
        : def.key === "breakout"
          ? breakout.slice(0, BUCKET_LIMIT)
          : growing.slice(0, BUCKET_LIMIT),
  }));
}

function platformViews(posts: Post[], accountIds: Set<string>): number {
  let views = 0;
  for (const post of posts) {
    if (accountIds.has(post.accountId)) views += post.metrics.views;
  }
  return views;
}

function summarizePlatform(
  platform: (typeof VISIBLE_PLATFORMS)[number],
  previousPosts: Post[],
  totalViews: number,
  aggregate: RangeAggregate
): PlatformSummary {
  const ids = new Set(platform.accounts.map((account) => account.id));
  const prevViews = platformViews(previousPosts, ids);
  const growth =
    prevViews > 0
      ? round1(((aggregate.totals.views - prevViews) / prevViews) * 100)
      : null;
  const engagementRate =
    aggregate.totals.reach > 0
      ? round1(
          (aggregate.totals.engagement / aggregate.totals.reach) * 100
        )
      : null;
  return {
    platform: platform.id,
    name: platform.name,
    color: platform.color,
    views: aggregate.totals.views,
    viewsSharePercent:
      totalViews > 0 ? round1((aggregate.totals.views / totalViews) * 100) : 0,
    viewsGrowthPercent: growth,
    engagement: aggregate.totals.engagement,
    engagementRate,
    posts: aggregate.postsCount,
  };
}

export function computeOverview(query: OverviewQuery): OverviewData {
  const { current, previous } = rangesFromQuery(query);
  const allIds = VISIBLE_PLATFORMS.flatMap((platform) =>
    platform.accounts.map((account) => account.id)
  );
  const currentFrom = toIsoDate(current.from);
  const currentTo = toIsoDate(current.to);
  const previousFrom = toIsoDate(previous.from);
  const previousTo = toIsoDate(previous.to);

  const cluster = query.cluster ?? "all";
  const currentPosts = filterByCluster(
    postsInRange(allIds, currentFrom, currentTo),
    cluster
  );
  const previousPosts = filterByCluster(
    postsInRange(allIds, previousFrom, previousTo),
    cluster
  );

  const currentAgg = aggregatePosts(currentPosts, current);
  const previousAgg = aggregatePosts(previousPosts, previous);

  const platformAggregates = VISIBLE_PLATFORMS.map((platform) => {
    const ids = platform.accounts.map((account) => account.id);
    return {
      platform,
      aggregate: aggregatePosts(
        currentPosts.filter((post) => ids.includes(post.accountId)),
        current
      ),
    };
  });

  const comparison: PlatformComparisonPoint[] = platformAggregates.map(
    ({ platform, aggregate }) => ({
      platform: platform.id,
      name: platform.name,
      color: platform.color,
      metrics: Object.fromEntries(
        COMPARISON_METRICS.map((metric) => [
          metric,
          aggregate.totals[metric] ?? 0,
        ])
      ),
    })
  );

  const platformSummaries: PlatformSummary[] = platformAggregates.map(
    ({ platform, aggregate }) =>
      summarizePlatform(
        platform,
        previousPosts,
        currentAgg.totals.views,
        aggregate
      )
  );

  return {
    kpis: buildKpis(OVERVIEW_KPIS, currentAgg, previousAgg),
    trend: buildTrend(OVERVIEW_TREND, currentAgg, previousAgg),
    comparison,
    platformSummaries,
    contentBuckets: classifyBuckets(currentPosts),
    webStats: computeWebStats(current, previous),
    topArticles: topArticlesInRange(currentFrom, currentTo),
    topicRecommendations: topicsForCluster(cluster),
  };
}
