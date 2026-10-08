"use client";

import { useMemo, useState } from "react";
import { ChartCard } from "@/components/data/chart-card";
import { DonutChart, type DonutDatum } from "@/components/data/donut-chart";
import { Button } from "@/components/ui/button";
import { CONTENT_FORMAT_COLORS } from "@/config/content-elements";
import { getQueryUiState, useContentType } from "@/hooks/use-analytics";
import { formatCompact, formatNumber } from "@/lib/format";
import type { ContentTypeMetric, PlatformId } from "@/types/analytics";
import { ScopeSelects } from "./scope-selects";

const METRICS: { key: ContentTypeMetric; label: string }[] = [
  { key: "content", label: "Total Content" },
  { key: "views", label: "Total Views" },
  { key: "engagements", label: "Total Engagements" },
];

interface ContentTypeSectionProps {
  cluster: string;
}

function formatMetricValue(metric: ContentTypeMetric, value: number): string {
  return metric === "content" ? formatNumber(value) : formatCompact(value);
}

export function ContentTypeSection({ cluster }: ContentTypeSectionProps) {
  const [platform, setPlatform] = useState<PlatformId | "all">("all");
  const [accountId, setAccountId] = useState<string>("all");
  const [metric, setMetric] = useState<ContentTypeMetric>("content");

  const query = useContentType({ platform, accountId, cluster });
  const status = getQueryUiState(query, (data) => data.totals.content === 0);
  const cardStatus =
    status === "loading" ? "pending" : status === "error" ? "error" : "success";
  const data = query.data;
  const isEmpty = status === "empty";

  const metricLabel =
    METRICS.find((item) => item.key === metric)?.label ?? "Total Content";

  const segments: DonutDatum[] = useMemo(
    () =>
      (data?.formats ?? []).map((point) => ({
        label: point.format,
        value: point[metric],
        color: CONTENT_FORMAT_COLORS[point.format],
      })),
    [data, metric]
  );

  return (
    <ChartCard
      title="🏞️ Content Type Analysis"
      titleClassName="text-lg font-semibold"
      description="Distribusi Gambar/Video/Carousel pada periode ini"
      status={cardStatus}
      isEmpty={isEmpty}
      onRetry={() => void query.refetch()}
      emptyTitle="Belum ada konten"
      emptyMessage="Belum ada konten terbit pada rentang tanggal ini."
      height={260}
      filter={
        <div
          role="group"
          aria-label="Pilih metrik content type"
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
        !isEmpty && data && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {data.formats.map((point) => (
              <span
                key={point.format}
                className="inline-flex items-center gap-1.5"
              >
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: CONTENT_FORMAT_COLORS[point.format],
                  }}
                />
                <span>{point.format}</span>
                <span className="font-medium tabular-nums">
                  {formatMetricValue(metric, point[metric])}
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
            label="content type"
          />
        </div>

        <DonutChart
          data={segments}
          centerLabel={metricLabel.toLowerCase()}
          centerValue={data?.totals[metric] ?? 0}
          height={200}
        />
      </div>
    </ChartCard>
  );
}
