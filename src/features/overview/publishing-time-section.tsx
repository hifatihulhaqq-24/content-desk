"use client";

import { useState } from "react";
import { ChartCard } from "@/components/data/chart-card";
import { BarChart, type BarRow } from "@/components/data/bar-chart";
import { getQueryUiState, usePublishingTime } from "@/hooks/use-analytics";
import { formatCompact, formatNumber } from "@/lib/format";
import type { PlatformId, PublishingTimeData } from "@/types/analytics";
import { PlatformChips } from "./platform-chips";

interface PublishingTimeSectionProps {
  cluster: string;
}

const HIGHLIGHT_COLOR = "var(--chart-1)";
const DEFAULT_BAR_COLOR = "color-mix(in oklch, var(--chart-1) 38%, transparent)";

function chartRows(
  points: PublishingTimeData["points"],
  metric: "content" | "impressions" | "engagements"
): BarRow[] {
  return points.map((point) => ({
    label: point.label,
    value: point[metric],
  }));
}

function topThreeLabels(
  points: PublishingTimeData["points"],
  metric: "content" | "impressions" | "engagements"
): string[] {
  return [...points]
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, 3)
    .map((point) => point.label);
}

export function PublishingTimeSection({ cluster }: PublishingTimeSectionProps) {
  const [platforms, setPlatforms] = useState<PlatformId[]>([]);
  const query = usePublishingTime({ platforms, cluster, accountId: "all", platform: "all" });
  const status = getQueryUiState(query, (data) => data.totals.content === 0);
  const cardStatus =
    status === "loading" ? "pending" : status === "error" ? "error" : "success";
  const data = query.data;
  const isEmpty = status === "empty";
  const points = data?.points ?? [];

  const bestByImpressions = topThreeLabels(points, "impressions")[0];

  const contentRows = chartRows(points, "content");
  const impressionsRows = chartRows(points, "impressions");
  const engagementsRows = chartRows(points, "engagements");

  const contentTop = new Set(topThreeLabels(points, "content"));
  const impressionsTop = new Set(topThreeLabels(points, "impressions"));
  const engagementsTop = new Set(topThreeLabels(points, "engagements"));

  const barColors = (
    rows: BarRow[],
    topSet: Set<string>
  ): Record<string, string> =>
    Object.fromEntries(
      rows.map((row) => [
        String(row.label),
        topSet.has(String(row.label)) ? HIGHLIGHT_COLOR : DEFAULT_BAR_COLOR,
      ])
    );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Publishing Time Analysis</h2>
          <p className="text-xs text-muted-foreground">
            Per jam tayang (07.00–21.00). 3 jam terbaik ditandai warna gelap.
            Terbaik Impression:{" "}
            {bestByImpressions ? bestByImpressions : "—"}
          </p>
        </div>
        <PlatformChips value={platforms} onChange={setPlatforms} label="Filter platform" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Total konten"
          titleClassName="text-sm font-semibold"
          status={cardStatus}
          isEmpty={isEmpty}
          onRetry={() => void query.refetch()}
          emptyTitle="Belum ada konten"
          emptyMessage="Belum ada konten terbit pada rentang tanggal ini."
          height={280}
          footer={
            !isEmpty && data && (
              <div className="text-xs text-muted-foreground">
                Total:{" "}
                <span className="font-medium tabular-nums text-foreground">
                  {formatNumber(data.totals.content)}
                </span>{" "}
                konten
              </div>
            )
          }
        >
          <BarChart
            data={contentRows}
            xKey="label"
            bars={[{ key: "value", label: "Total konten" }]}
            orientation="vertical"
            barColors={barColors(contentRows, contentTop)}
            height={240}
            showLegend={false}
          />
        </ChartCard>

        <ChartCard
          title="Impression"
          titleClassName="text-sm font-semibold"
          status={cardStatus}
          isEmpty={isEmpty}
          onRetry={() => void query.refetch()}
          emptyTitle="Belum ada konten"
          emptyMessage="Belum ada konten terbit pada rentang tanggal ini."
          height={280}
          footer={
            !isEmpty && data && (
              <div className="text-xs text-muted-foreground">
                Total:{" "}
                <span className="font-medium tabular-nums text-foreground">
                  {formatCompact(data.totals.impressions)}
                </span>{" "}
                Impression
              </div>
            )
          }
        >
          <BarChart
            data={impressionsRows}
            xKey="label"
            bars={[{ key: "value", label: "Impression" }]}
            orientation="vertical"
            barColors={barColors(impressionsRows, impressionsTop)}
            height={240}
            showLegend={false}
          />
        </ChartCard>

        <ChartCard
          title="Engagement"
          titleClassName="text-sm font-semibold"
          status={cardStatus}
          isEmpty={isEmpty}
          onRetry={() => void query.refetch()}
          emptyTitle="Belum ada konten"
          emptyMessage="Belum ada konten terbit pada rentang tanggal ini."
          height={280}
          footer={
            !isEmpty && data && (
              <div className="text-xs text-muted-foreground">
                Total:{" "}
                <span className="font-medium tabular-nums text-foreground">
                  {formatCompact(data.totals.engagements)}
                </span>{" "}
                Engagement
              </div>
            )
          }
        >
          <BarChart
            data={engagementsRows}
            xKey="label"
            bars={[{ key: "value", label: "Engagement" }]}
            orientation="vertical"
            barColors={barColors(engagementsRows, engagementsTop)}
            height={240}
            showLegend={false}
          />
        </ChartCard>
      </div>
    </div>
  );
}
