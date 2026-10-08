"use client";

import { useMemo, useState } from "react";
import { BarChart, type BarRow } from "@/components/data/bar-chart";
import { ChartCard } from "@/components/data/chart-card";
import { Button } from "@/components/ui/button";
import { getQueryUiState, usePublishingTime } from "@/hooks/use-analytics";
import { formatCompact, formatNumber, formatPercent } from "@/lib/format";
import type { PlatformId, PublishingMetric } from "@/types/analytics";
import { ScopeSelects } from "./scope-selects";

const METRICS: { key: PublishingMetric; label: string }[] = [
  { key: "content", label: "Total Content" },
  { key: "views", label: "Total Views" },
  { key: "engagements", label: "Total Engagements" },
];

const DEFAULT_BAR_COLOR = "color-mix(in oklch, var(--chart-1) 38%, transparent)";
const HIGHLIGHT_COLOR = "var(--chart-1)";

const METRIC_UNIT: Record<PublishingMetric, string> = {
  content: "konten",
  views: "tayangan",
  engagements: "interaksi",
};

interface PublishingTimeSectionProps {
  cluster: string;
}

function formatMetricValue(metric: PublishingMetric, value: number): string {
  return metric === "content" ? formatNumber(value) : formatCompact(value);
}

export function PublishingTimeSection({ cluster }: PublishingTimeSectionProps) {
  const [platform, setPlatform] = useState<PlatformId | "all">("all");
  const [accountId, setAccountId] = useState<string>("all");
  const [metric, setMetric] = useState<PublishingMetric>("content");

  const query = usePublishingTime({ platform, accountId, cluster });
  const status = getQueryUiState(query, (data) => data.totals.content === 0);
  const cardStatus =
    status === "loading" ? "pending" : status === "error" ? "error" : "success";
  const data = query.data;
  const isEmpty = status === "empty";

  const points = useMemo(() => data?.points ?? [], [data]);
  const metricLabel =
    METRICS.find((item) => item.key === metric)?.label ?? "Total Content";

  const bestHours = useMemo(
    () =>
      [...points]
        .sort((a, b) => b[metric] - a[metric])
        .slice(0, 3),
    [points, metric]
  );

  const highlightLabels = useMemo(
    () => new Set(bestHours.map((point) => point.label)),
    [bestHours]
  );

  const rows: BarRow[] = points.map((point) => ({
    label: point.label,
    value: point[metric],
  }));

  const barColors = Object.fromEntries(
    rows.map((row) => [
      String(row.label),
      highlightLabels.has(String(row.label))
        ? HIGHLIGHT_COLOR
        : DEFAULT_BAR_COLOR,
    ])
  );

  return (
    <ChartCard
      title="⏱️ Publishing Time Analysis"
      titleClassName="text-lg font-semibold"
      description={`Distribusi ${metricLabel.toLowerCase()} per jam (07.00–21.00) pada periode ini`}
      status={cardStatus}
      isEmpty={isEmpty}
      onRetry={() => void query.refetch()}
      emptyTitle="Belum ada konten"
      emptyMessage="Belum ada konten terbit pada rentang tanggal ini."
      height={320}
      filter={
        <div
          role="group"
          aria-label="Pilih metrik publishing time"
          className="flex flex-wrap rounded-lg border p-0.5"
        >
          {METRICS.map((item) => (
            <Button
              key={item.key}
              type="button"
              size="sm"
              variant={metric === item.key ? "secondary" : "ghost"}
              aria-pressed={metric === item.key}
              onClick={() => setMetric(item.key)}
              className="h-7 px-2.5 text-xs"
            >
              {item.label}
            </Button>
          ))}
        </div>
      }
      footer={
        !isEmpty && bestHours.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">
              Jam posting terbaik ({metricLabel.toLowerCase()}):
            </span>
            {bestHours.map((point) => (
              <span
                key={point.hour}
                className="inline-flex items-center gap-1.5 rounded-full border bg-accent/60 px-2 py-0.5 text-xs font-medium tabular-nums"
              >
                <span className="text-foreground">{point.label}</span>
                <span className="text-muted-foreground">
                  {formatMetricValue(metric, point[metric])}{" "}
                  {METRIC_UNIT[metric]}
                </span>
                <span className="text-primary">
                  {formatPercent(
                    points.length > 0
                      ? (point[metric] /
                          Math.max(
                            1,
                            points.reduce((sum, item) => sum + item[metric], 0)
                          )) *
                        100
                      : 0
                  )}
                </span>
              </span>
            ))}
          </div>
        )
      }
    >
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <ScopeSelects
            platform={platform}
            accountId={accountId}
            onPlatformChange={setPlatform}
            onAccountChange={setAccountId}
            label="publishing time"
          />
        </div>

        <BarChart
          data={rows}
          xKey="label"
          bars={[{ key: "value", label: metricLabel }]}
          orientation="vertical"
          barColors={barColors}
          height={240}
          showLegend={false}
        />
      </div>
    </ChartCard>
  );
}
