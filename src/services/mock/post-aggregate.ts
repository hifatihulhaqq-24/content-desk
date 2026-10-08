import type { Post, TrendPoint } from "@/types/analytics";
import { listDays, type DateRange } from "@/lib/date";
import type { RangeAggregate } from "./aggregate";

const DAILY_SUM_KEYS = [
  "reach",
  "impressions",
  "engagement",
  "views",
  "likes",
  "comments",
  "shares",
  "saves",
] as const;

export function engagementOf(post: Post): number {
  const m = post.metrics;
  return m.likes + m.comments + m.shares + m.saves;
}

export function filterByCluster(posts: Post[], cluster?: string): Post[] {
  if (!cluster || cluster === "all") return posts;
  return posts.filter((post) => post.cluster === cluster);
}

/**
 * Agregasi harian berbasis daftar konten (bukan deret akun) sehingga
 * filter cluster ikut memengaruhi KPI/trend/comparison secara konsisten.
 */
export function aggregatePosts(
  posts: Post[],
  range: DateRange
): RangeAggregate {
  const days = listDays(range);
  const index = new Map(days.map((day, i) => [day, i]));

  const daily: TrendPoint[] = days.map((date) => {
    const point: TrendPoint = {
      date,
      followers: 0,
      followersGrowth: 0,
      posts: 0,
      engagementRate: 0,
      impressionsCtr: 0,
      avgViewDuration: 0,
    };
    for (const key of DAILY_SUM_KEYS) point[key] = 0;
    return point;
  });

  let counted = 0;
  for (const post of posts) {
    const day = post.publishedAt.slice(0, 10);
    const i = index.get(day);
    if (i === undefined) continue;
    counted++;
    const point = daily[i];
    const m = post.metrics;
    point.reach = (point.reach as number) + m.reach;
    point.impressions = (point.impressions as number) + m.impressions;
    point.engagement = (point.engagement as number) + engagementOf(post);
    point.views = (point.views as number) + m.views;
    point.likes = (point.likes as number) + m.likes;
    point.comments = (point.comments as number) + m.comments;
    point.shares = (point.shares as number) + m.shares;
    point.saves = (point.saves as number) + m.saves;
    point.posts = (point.posts as number) + 1;
  }

  for (const point of daily) {
    const reach = point.reach as number;
    point.engagementRate =
      reach > 0 ? ((point.engagement as number) / reach) * 100 : 0;
  }

  const totals: Record<string, number> = { posts: 0 };
  for (const key of DAILY_SUM_KEYS) totals[key] = 0;
  for (const point of daily) {
    for (const key of DAILY_SUM_KEYS) totals[key] += point[key] as number;
  }
  totals.posts = counted;

  return {
    days,
    daily,
    totals,
    followersStart: 0,
    followersEnd: 0,
    postsCount: counted,
  };
}
