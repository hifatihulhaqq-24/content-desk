"use client";

import { useState } from "react";
import { ChartCard } from "@/components/data/chart-card";
import { DonutChart, type DonutDatum } from "@/components/data/donut-chart";
import { PlatformChips } from "./platform-chips";
import { CONTENT_FORMAT_COLORS } from "@/config/content-elements";
import { getQueryUiState, useContentType } from "@/hooks/use-analytics";
import { formatCompact, formatNumber } from "@/lib/format";
import type { PlatformId } from "@/types/analytics";

interface ContentTypeSectionProps {
  cluster: string;
}

function formatMetricValue(metric: "content" | "impressions" | "engagements", value: number): string {
  return metric === "content" ? formatNumber(value) : formatCompact(value);
}

export function ContentTypeSection({ cluster }: ContentTypeSectionProps) {
  const [platforms, setPlatforms] = useState<PlatformId[]>([]);
  const query = useContentType({ platforms, cluster, accountId: "all", platform: "all" });
  const status = getQueryUiState(query, (data) => data.totals.content === 0);
  const cardStatus =
    status === "loading" ? "pending" : status === "error" ? "error" : "success";
  const data = query.data;
  const isEmpty = status === "empty";

  const contentSegments: DonutDatum[] =
    (data?.formats ?? []).map((point) => ({
      label: point.format,
      value: point.content,
      color: CONTENT_FORMAT_COLORS[point.format],
    }));
  const impressionsSegments: DonutDatum[] =
    (data?.formats ?? []).map((point) => ({
      label: point.format,
      value: point.impressions,
      color: CONTENT_FORMAT_COLORS[point.format],
    }));
  const engagementsSegments: DonutDatum[] =
    (data?.formats ?? []).map((point) => ({
      label: point.format,
      value: point.engagements,
      color: CONTENT_FORMAT_COLORS[point.format],
    }));

  const donutFooter = (metric: "content" | "impressions" | "engagements") =>
    !isEmpty && data ? (
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {data.formats.map((point) => (
          <span key={point.format} className="inline-flex items-center gap-1.5">
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
    ) : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Content Type Analysis</h2>
          <p className="text-xs text-muted-foreground">
            Distribusi Single Image / Video / Carousel pada periode ini.
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
          height={290}
          footer={donutFooter("content")}
        >
          <DonutChart
            data={contentSegments}
            centerLabel="konten"
            centerValue={data?.totals.content ?? 0}
            height={220}
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
          height={290}
          footer={donutFooter("impressions")}
        >
          <DonutChart
            data={impressionsSegments}
            centerLabel="Impression"
            centerValue={data?.totals.impressions ?? 0}
            height={220}
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
          height={290}
          footer={donutFooter("engagements")}
        >
          <DonutChart
            data={engagementsSegments}
            centerLabel="Engagement"
            centerValue={data?.totals.engagements ?? 0}
            height={220}
          />
        </ChartCard>
      </div>
    </div>
  );
}
