import { addDays } from "date-fns";
import type {
  DateRangeQuery,
  KpiMetric,
  TrendPoint,
  TrendResult,
} from "@/types/analytics";
import { getMetric, type MetricFormat } from "@/config/metrics";
import { listDays, previousRange, toIsoDate, type DateRange } from "@/lib/date";
import { dailyAt } from "./series";
import { postsInRange } from "./posts";

const SUM_METRICS = [
  "reach",
  "impressions",
  "engagement",
  "likes",
  "comments",
  "shares",
  "saves",
  "clicks",
  "profileVisits",
  "views",
  "watchTime",
] as const;


export interface RangeAggregate {
  days: string[];
  daily: TrendPoint[];
  totals: Record<string, number>;
  followersStart: number;
  followersEnd: number;
  postsCount: number;
}

type KpiAggregation = "sum" | "end" | "rate" | "avg";

const KPI_AGGREGATION: Record<string, KpiAggregation> = {
  followers: "end",
  engagementRate: "rate",
  impressionsCtr: "rate",
  avgViewDuration: "avg",
  posts: "sum",
};

function emptyAggregate(): RangeAggregate {
  return {
    days: [],
    daily: [],
    totals: Object.fromEntries(SUM_METRICS.map((m) => [m, 0])),
    followersStart: 0,
    followersEnd: 0,
    postsCount: 0,
  };
}

export function aggregateRange(
  accountIds: string[],
  range: DateRange
): RangeAggregate {
  const days = listDays(range);
  if (days.length === 0) return emptyAggregate();

  const prevDay = toIsoDate(addDays(range.from, -1));
  const daily: TrendPoint[] = days.map((day) => {
    const point: TrendPoint = { date: day };
    let followers = 0;
    for (const metric of SUM_METRICS) point[metric] = 0;
    for (const id of accountIds) {
      const record = dailyAt(id, day);
      for (const metric of SUM_METRICS) {
        point[metric] = (point[metric] as number) + record[metric];
      }
      followers += record.followers;
    }
    point.followers = followers;
    point.posts = postsInRange(accountIds, day, day).length;
    return point;
  });

  let followersStart = 0;
  for (const id of accountIds) followersStart += dailyAt(id, prevDay).followers;

  for (let i = 0; i < daily.length; i++) {
    const point = daily[i];
    const reach = point.reach as number;
    const impressions = point.impressions as number;
    const views = point.views as number;
    point.engagementRate = reach > 0 ? ((point.engagement as number) / reach) * 100 : 0;
    point.impressionsCtr =
      impressions > 0 ? ((point.clicks as number) / impressions) * 100 : 0;
    point.avgViewDuration =
      views > 0 ? ((point.watchTime as number) * 3600) / views : 0;
    const previousFollowers = i === 0 ? followersStart : (daily[i - 1].followers as number);
    point.followersGrowth = (point.followers as number) - previousFollowers;
  }

  const totals: Record<string, number> = { posts: 0 };
  for (const metric of SUM_METRICS) totals[metric] = 0;
  for (const point of daily) {
    for (const metric of SUM_METRICS) {
      totals[metric] += point[metric] as number;
    }
  }
  totals.posts = postsInRange(accountIds, days[0], days[days.length - 1]).length;

  return {
    days,
    daily,
    totals,
    followersStart,
    followersEnd: daily[daily.length - 1].followers as number,
    postsCount: totals.posts,
  };
}

function aggregateValue(
  key: string,
  agg: KpiAggregation,
  aggregate: RangeAggregate
): number {
  switch (agg) {
    case "end":
      return aggregate.followersEnd;
    case "rate": {
      if (key === "impressionsCtr") {
        return aggregate.totals.impressions > 0
          ? (aggregate.totals.clicks / aggregate.totals.impressions) * 100
          : 0;
      }
      return aggregate.totals.reach > 0
        ? (aggregate.totals.engagement / aggregate.totals.reach) * 100
        : 0;
    }
    case "avg":
      return aggregate.totals.views > 0
        ? (aggregate.totals.watchTime * 3600) / aggregate.totals.views
        : 0;
    default:
      return aggregate.totals[key] ?? 0;
  }
}

export function buildKpis(
  keys: { key: string; label?: string }[],
  current: RangeAggregate,
  previous: RangeAggregate
): KpiMetric[] {
  return keys.map(({ key, label }) => {
    const metric = getMetric(key);
    const format: MetricFormat = metric.format;
    const agg = KPI_AGGREGATION[key] ?? "sum";
    const value = aggregateValue(key, agg, current);
    const previousRaw = current.days.length > 0 ? aggregateValue(key, agg, previous) : 0;
    const hasPrevious = previousRaw !== 0;
    const isRate = format === "percent";
    const rawDelta = hasPrevious ? value - previousRaw : null;
    const deltaPercent =
      rawDelta === null
        ? null
        : isRate
          ? rawDelta
          : (rawDelta / Math.abs(previousRaw)) * 100;
    return {
      key,
      label: label ?? metric.label,
      value,
      previousValue: hasPrevious ? previousRaw : null,
      deltaPercent: deltaPercent !== null ? Math.round(deltaPercent * 10) / 10 : null,
      deltaUnit: isRate ? "pp" : "percent",
      format,
    };
  });
}

export function buildTrend(
  metricKeys: string[],
  current: RangeAggregate,
  previous: RangeAggregate
): TrendResult {
  const pick = (points: TrendPoint[]) =>
    points.map((point) => {
      const next: TrendPoint = { date: point.date };
      for (const key of metricKeys) next[key] = point[key] ?? 0;
      return next;
    });
  return { points: pick(current.daily), previous: pick(previous.daily) };
}

export function rangesFromQuery(
  query: DateRangeQuery
): { current: DateRange; previous: DateRange } {
  const current: DateRange = {
    from: new Date(`${query.from}T00:00:00`),
    to: new Date(`${query.to}T00:00:00`),
  };
  return { current, previous: previousRange(current) };
}
