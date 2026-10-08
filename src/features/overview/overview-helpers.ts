import type { OverviewData, TrendPoint } from "@/types/analytics";

export function sparklineFromTrend(
  points: TrendPoint[],
  key: string
): number[] | null {
  const values = points.map((point) =>
    typeof point[key] === "number" ? (point[key] as number) : 0
  );
  return values.length > 1 ? values : null;
}

export function overviewIsEmpty(data: OverviewData): boolean {
  return (
    data.trend.points.length === 0 &&
    data.platformSummaries.length === 0
  );
}
