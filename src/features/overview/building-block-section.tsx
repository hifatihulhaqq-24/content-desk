"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  type BarRow,
  type BarShapeInput,
} from "@/components/data/bar-chart";
import { ChartCard } from "@/components/data/chart-card";
import { seriesColor } from "@/components/data/chart-common";
import { Button } from "@/components/ui/button";
import { BUILDING_BLOCK_LABELS } from "@/config/content-elements";
import { getQueryUiState, useBuildingBlock } from "@/hooks/use-analytics";
import { formatCompact, formatNumber } from "@/lib/format";
import type { BuildingBlockMetric, PlatformId } from "@/types/analytics";
import { ScopeSelects } from "./scope-selects";

const METRICS: { key: BuildingBlockMetric; label: string }[] = [
  { key: "content", label: "Total Content" },
  { key: "views", label: "Total Views" },
  { key: "engagements", label: "Total Engagements" },
];

const Y_AXIS_WIDTH = 96;
const VALUE_LABEL_MARGIN = 72;

const COUNT_LIKE_METRICS = new Set<BuildingBlockMetric>([
  "content",
  "viewsPerContent",
  "engagementsPerContent",
]);

interface BuildingBlockSectionProps {
  cluster: string;
}

function formatMetricValue(metric: BuildingBlockMetric, value: number): string {
  return COUNT_LIKE_METRICS.has(metric) ? formatNumber(value) : formatCompact(value);
}

function renderValueLabel(metric: BuildingBlockMetric) {
  return function ValueLabel({ row, x, y, width, height }: BarShapeInput) {
    return (
      <text
        x={x + width + 8}
        y={y + height / 2}
        dominantBaseline="middle"
        fontSize={11}
        className="fill-foreground font-semibold tabular-nums"
      >
        {formatMetricValue(metric, Number(row.value ?? 0))}
      </text>
    );
  };
}

export function BuildingBlockSection({ cluster }: BuildingBlockSectionProps) {
  const [platform, setPlatform] = useState<PlatformId | "all">("all");
  const [accountId, setAccountId] = useState<string>("all");
  const [metric, setMetric] = useState<BuildingBlockMetric>("views");

  const query = useBuildingBlock({ platform, accountId, cluster });
  const status = getQueryUiState(query, (data) =>
    data.blocks.every((block) => block.content === 0)
  );
  const cardStatus =
    status === "loading" ? "pending" : status === "error" ? "error" : "success";
  const data = query.data;
  const isEmpty = status === "empty";

  const metricLabel =
    METRICS.find((item) => item.key === metric)?.label ?? "Total Views";

  const rows: BarRow[] = useMemo(
    () =>
      [...(data?.blocks ?? [])]
        .sort((a, b) => b[metric] - a[metric])
        .map((block) => ({
          name: BUILDING_BLOCK_LABELS[block.block],
          value: block[metric],
        })),
    [data, metric]
  );

  const barColors = Object.fromEntries(
    rows.map((row, index) => [String(row.name), seriesColor(index)])
  );

  return (
    <ChartCard
      title="🧩 Building Block Analysis"
      titleClassName="text-lg font-semibold"
      description="Top 5 penyusun konten"
      status={cardStatus}
      isEmpty={isEmpty}
      onRetry={() => void query.refetch()}
      emptyTitle="Belum ada konten"
      emptyMessage="Belum ada konten terbit pada rentang tanggal ini."
      height={260}
      filter={
        <div
          role="group"
          aria-label="Pilih metrik building block"
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
        !isEmpty && (
          <span>
            Diurutkan menurut {metricLabel.toLowerCase()} · Hover bar untuk
            detail
          </span>
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
            label="building block"
          />
        </div>

        <BarChart
          data={rows}
          xKey="name"
          bars={[{ key: "value", label: metricLabel }]}
          orientation="horizontal"
          barColors={barColors}
          height={200}
          showLegend={false}
          yAxisWidth={Y_AXIS_WIDTH}
          marginRight={VALUE_LABEL_MARGIN}
          renderBarShape={renderValueLabel(metric)}
        />
      </div>
    </ChartCard>
  );
}
