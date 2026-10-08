import type { TrendPoint, WebStats } from "@/types/analytics";
import { listDays, type DateRange } from "@/lib/date";
import { buildKpis, type RangeAggregate } from "./aggregate";
import { gauss, randRange } from "./random";

export const WEB_KPIS = [
  { key: "pv", label: "Jumlah PV" },
  { key: "uniqueVisitors", label: "Uniq Visitor" },
  { key: "engagementRate", label: "Engagement Rate" },
];

interface WebDay {
  pv: number;
  uniqueVisitors: number;
  interactions: number;
}

function dailyWeb(day: string): WebDay {
  const weekday = new Date(`${day}T00:00:00`).getDay();
  const weekendFactor = weekday === 0 || weekday === 6 ? 0.72 : 1;
  const growth = 1 + (listGrowthBias(day) - 0.5) * 0.3;
  const pv = Math.max(
    15_000,
    Math.round(145_000 * weekendFactor * growth * (1 + gauss(day, "pv") * 0.16))
  );
  const uniqueVisitors = Math.max(
    5_000,
    Math.round(pv * randRange(0.55, 0.72, day, "uv"))
  );
  const interactions = Math.round(pv * randRange(0.035, 0.085, day, "inter"));
  return { pv, uniqueVisitors, interactions };
}

/** Bias pertumbuhan halus deterministik dari hari ke hari. */
function listGrowthBias(day: string): number {
  const index = Math.floor(Date.parse(`${day}T00:00:00Z`) / 86_400_000);
  return (index % 90) / 90;
}

function aggregateWeb(range: DateRange): RangeAggregate {
  const days = listDays(range);
  const daily: TrendPoint[] = days.map((date) => {
    const { pv, uniqueVisitors, interactions } = dailyWeb(date);
    return {
      date,
      pv,
      uniqueVisitors,
      // reach = pv & engagement = interaksi agar jalur "rate" buildKpis
      // menghitung engagement per PV.
      reach: pv,
      engagement: interactions,
      engagementRate: pv > 0 ? (interactions / pv) * 100 : 0,
      impressions: 0,
      views: 0,
      posts: 0,
      followers: 0,
    };
  });

  const totals: Record<string, number> = {
    pv: 0,
    uniqueVisitors: 0,
    reach: 0,
    engagement: 0,
    impressions: 0,
    views: 0,
    posts: 0,
  };
  for (const point of daily) {
    totals.pv += point.pv as number;
    totals.uniqueVisitors += point.uniqueVisitors as number;
    totals.reach += point.reach as number;
    totals.engagement += point.engagement as number;
  }

  return {
    days,
    daily,
    totals,
    followersStart: 0,
    followersEnd: 0,
    postsCount: 0,
  };
}

export function computeWebStats(
  current: DateRange,
  previous: DateRange
): WebStats {
  const currentAgg = aggregateWeb(current);
  const previousAgg = aggregateWeb(previous);
  return {
    kpis: buildKpis(WEB_KPIS, currentAgg, previousAgg),
    points: currentAgg.daily,
  };
}
