import { addDays } from "date-fns";
import type {
  ContentBucket,
  MedianInsight,
  OverviewData,
  OverviewQuery,
  PlatformComparisonPoint,
  PlatformSummary,
  Post,
} from "@/types/analytics";
import { VISIBLE_PLATFORMS } from "@/config/platforms";
import { toIsoDate } from "@/lib/date";
import { buildKpis, buildTrend, rangesFromQuery, type RangeAggregate } from "./aggregate";
import {
  aggregatePosts,
  engagementOf,
  filterByCluster,
  filterByTag,
} from "./post-aggregate";
import { postsInRange } from "./posts";
import { isoToDayIndex } from "./random";
import { topArticlesInRange } from "./articles";
import { computeWebStats } from "./web";
import { topicsForCluster } from "./topics";

export const OVERVIEW_KPIS = [
  { key: "impressions", label: "Impression" },
  { key: "engagement", label: "Engagement" },
  { key: "engagementRate", label: "Engagement Rate" },
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

/** Ambang Highlight: impression ≥ 3× median cluster (catetan Prambanan 8 Okt 2026). */
const HIGHLIGHT_MULTIPLIER = 3;
/** Ambang Low Light: impression < 0,5× median cluster. */
const LOW_LIGHT_MULTIPLIER = 0.5;

/** Window standar cluster: median per minggu selalu 8 minggu terakhir. */
const STANDARD_WEEKS = 8;

const BUCKET_DEFS = [
  {
    key: "highlight" as const,
    label: "Highlight",
    description: "Impression ≥ 3× median cluster pada periode ini.",
  },
  {
    key: "lowLight" as const,
    label: "Low Light",
    description: "Impression terendah dibanding median cluster pada periode ini.",
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
  const byImprDesc = [...posts].sort(
    (a, b) => b.metrics.impressions - a.metrics.impressions
  );
  const impressions = byImprDesc.map((post) => post.metrics.impressions);
  const med = median(impressions);

  let highlight: Post[] = [];
  let lowLight: Post[] = [];

  if (posts.length >= 6) {
    highlight = byImprDesc.filter(
      (post) => post.metrics.impressions >= med * HIGHLIGHT_MULTIPLIER
    );
    lowLight = byImprDesc
      .filter((post) => post.metrics.impressions < med * LOW_LIGHT_MULTIPLIER)
      .reverse();
  } else if (posts.length > 1) {
    const edge = Math.max(1, Math.ceil(posts.length / 3));
    highlight = byImprDesc.slice(0, edge);
    lowLight = byImprDesc.slice(posts.length - edge).reverse();
  } else if (posts.length === 1) {
    highlight = byImprDesc;
  }

  return BUCKET_DEFS.map((def) => ({
    ...def,
    medianImpressions: med,
    posts:
      (def.key === "lowLight" ? lowLight : highlight).slice(0, BUCKET_LIMIT),
  }));
}

/**
 * Standar cluster (threshold): median dari median mingguan per konten
 * selama 8 minggu terakhir sebelum periode berjalan (mock interim —
 * contract final dari BE).
 */
function weeklyStandard(
  posts: Post[],
  valueOf: (post: Post) => number
): number | null {
  if (posts.length === 0) return null;
  const minDay = Math.min(
    ...posts.map((post) => isoToDayIndex(post.publishedAt.slice(0, 10)))
  );
  const weeks = new Map<number, number[]>();
  for (const post of posts) {
    const dayIndex = isoToDayIndex(post.publishedAt.slice(0, 10));
    const week = Math.floor((dayIndex - minDay) / 7);
    const bucket = weeks.get(week);
    if (bucket) bucket.push(valueOf(post));
    else weeks.set(week, [valueOf(post)]);
  }
  const weekMedians = [...weeks.values()]
    .map(median)
    .filter((value) => value > 0);
  return weekMedians.length > 0 ? median(weekMedians) : null;
}

function computeMedians(
  currentPosts: Post[],
  standardPosts: Post[]
): MedianInsight[] {
  const valueOf: Record<MedianInsight["key"], (post: Post) => number> = {
    impressions: (post) => post.metrics.impressions,
    engagements: engagementOf,
  };

  const build = (
    key: MedianInsight["key"],
    label: string
  ): MedianInsight => {
    const extract = valueOf[key];
    const values = currentPosts.map(extract);
    const med = median(values);
    const standard = weeklyStandard(standardPosts, extract) ?? med;
    const ratio = standard > 0 ? round1(med / standard) : 0;
    const below = values.filter((value) => value < standard * 0.7).length;
    const above = values.filter((value) => value > standard * 1.3).length;
    const normal = Math.max(0, values.length - below - above);
    return {
      key,
      label,
      median: med,
      threshold: standard,
      ratioToThreshold: ratio,
      sampleSize: values.length,
      buckets: [
        {
          key: "below",
          label: "Di bawah standar",
          rule: "< 0,7× standar",
          count: below,
        },
        {
          key: "normal",
          label: "Sesuai standar",
          rule: "0,7–1,3× standar",
          count: normal,
        },
        {
          key: "above",
          label: "Di atas standar",
          rule: "> 1,3× standar",
          count: above,
        },
      ],
    };
  };

  return [
    build("impressions", "Impression per konten"),
    build("engagements", "Engagement per konten"),
  ];
}

function platformImpressions(posts: Post[], accountIds: Set<string>): number {
  let impressions = 0;
  for (const post of posts) {
    if (accountIds.has(post.accountId)) impressions += post.metrics.impressions;
  }
  return impressions;
}

function summarizePlatform(
  platform: (typeof VISIBLE_PLATFORMS)[number],
  previousPosts: Post[],
  totalImpressions: number,
  totalPosts: number,
  aggregate: RangeAggregate
): PlatformSummary {
  const ids = new Set(platform.accounts.map((account) => account.id));
  const prevImpressions = platformImpressions(previousPosts, ids);
  const growth =
    prevImpressions > 0
      ? round1(
          ((aggregate.totals.impressions - prevImpressions) / prevImpressions) *
            100
        )
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
    impressions: aggregate.totals.impressions,
    impressionsSharePercent:
      totalImpressions > 0
        ? round1((aggregate.totals.impressions / totalImpressions) * 100)
        : 0,
    impressionsGrowthPercent: growth,
    engagement: aggregate.totals.engagement,
    engagementRate,
    posts: aggregate.postsCount,
    postsSharePercent:
      totalPosts > 0 ? round1((aggregate.postsCount / totalPosts) * 100) : 0,
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

  // Standar cluster: 8 minggu sebelum periode berjalan.
  const standardFrom = toIsoDate(addDays(current.from, -7 * STANDARD_WEEKS));
  const standardTo = toIsoDate(addDays(current.from, -1));
  const standardPosts = filterByCluster(
    postsInRange(allIds, standardFrom, standardTo),
    cluster
  );

  const currentAgg = aggregatePosts(currentPosts, current);
  const previousAgg = aggregatePosts(previousPosts, previous);

  // Filter tagging hanya berlaku untuk section Data Platform.
  const taggedCurrentPosts = filterByTag(currentPosts, query.tagging);
  const taggedPreviousPosts = filterByTag(previousPosts, query.tagging);

  const platformAggregates = VISIBLE_PLATFORMS.map((platform) => {
    const ids = platform.accounts.map((account) => account.id);
    return {
      platform,
      aggregate: aggregatePosts(
        taggedCurrentPosts.filter((post) => ids.includes(post.accountId)),
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

  const totalImpressions = platformAggregates.reduce(
    (sum, { aggregate }) => sum + aggregate.totals.impressions,
    0
  );
  const totalPosts = platformAggregates.reduce(
    (sum, { aggregate }) => sum + aggregate.postsCount,
    0
  );

  const platformSummaries: PlatformSummary[] = platformAggregates.map(
    ({ platform, aggregate }) =>
      summarizePlatform(
        platform,
        taggedPreviousPosts,
        totalImpressions,
        totalPosts,
        aggregate
      )
  );

  return {
    kpis: buildKpis(OVERVIEW_KPIS, currentAgg, previousAgg),
    trend: buildTrend(OVERVIEW_TREND, currentAgg, previousAgg),
    comparison,
    platformSummaries,
    contentBuckets: classifyBuckets(currentPosts),
    medians: computeMedians(currentPosts, standardPosts),
    webStats: computeWebStats(current, previous),
    topArticles: topArticlesInRange(currentFrom, currentTo),
    topicRecommendations: topicsForCluster(cluster),
  };
}
