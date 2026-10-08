"use client";

import { useState } from "react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { ErrorState } from "@/components/data/states";
import { Separator } from "@/components/ui/separator";
import { getQueryUiState, useOverview } from "@/hooks/use-analytics";
import { countDays, previousRange } from "@/lib/date";
import { formatDateShort, formatRange } from "@/lib/format";
import { useDateRange } from "@/hooks/use-date-range";
import {
  CLUSTERS,
  type ClusterFilter as ClusterFilterValue,
} from "@/config/clusters";
import { TAGGING_ALL } from "@/config/tagging";
import { ClusterFilter } from "./cluster-filter";
import { ComparisonSection } from "./comparison-section";
import { ContentBucketsSection } from "./content-buckets-section";
import { ContentTypeSection } from "./content-type-section";
import { BuildingBlockSection } from "./building-block-section";
import { KpiSection } from "./kpi-section";
import { overviewIsEmpty } from "./overview-helpers";
import { PlatformSummarySection } from "./platform-summary-section";
import { PublishingTimeSection } from "./publishing-time-section";
import { TopicRecommendationSection } from "./topic-recommendation-section";
import { MedianSection } from "./median-section";

const SHOW_COMPARISON_SECTION = false;

export function OverviewView() {
  const [cluster, setCluster] = useState<ClusterFilterValue>(CLUSTERS[0]);
  const [tagging, setTagging] = useState<string>(TAGGING_ALL);
  const { range, query } = useDateRange();
  const overviewQuery = useOverview(cluster, tagging);
  const status = getQueryUiState(overviewQuery, overviewIsEmpty);
  const data = overviewQuery.data;
  const onRetry = () => void overviewQuery.refetch();

  const currentRange = query;
  const prevCount = countDays(range);
  const prevRange = previousRange(range);
  const subtitle = [
    `${prevCount} hari terakhir (${formatRange(currentRange.from, currentRange.to)})`,
    `perubahan dibanding ${prevCount} hari sebelumnya (${formatDateShort(prevRange.from)}–${formatDateShort(prevRange.to)})`,
    "data ilustrasi",
  ].join(" · ");

  return (
    <PageContainer>
      <PageHeader
        title={`Overview · ${cluster}`}
        description={subtitle}
        actions={<ClusterFilter value={cluster} onChange={setCluster} />}
      />

      {status === "error" ? (
        <ErrorState onRetry={onRetry} className="min-h-72" />
      ) : (
        <div className="space-y-6">
          <TopicRecommendationSection
            status={status}
            topics={data?.topicRecommendations ?? []}
            onRetry={onRetry}
          />

          <Separator />

          <KpiSection
            status={status}
            kpis={data?.kpis ?? []}
            trendPoints={data?.trend.points ?? []}
            previousPoints={data?.trend.previous ?? []}
            onRetry={onRetry}
            currentLabel={`${prevCount} hari ini`}
            previousLabel={
              prevCount === 7
                ? "hari yang sama minggu lalu"
                : `${prevCount} hari sebelumnya`
            }
          />

          <Separator />

          <MedianSection
            status={status}
            medians={data?.medians ?? []}
            onRetry={onRetry}
          />

          <Separator />

          <PlatformSummarySection
            status={status}
            summaries={data?.platformSummaries ?? []}
            tagging={tagging}
            onTaggingChange={setTagging}
            onRetry={onRetry}
          />

          <Separator />

          <PublishingTimeSection />

          <Separator />

          <ContentTypeSection cluster={cluster} />

          <Separator />

          <BuildingBlockSection cluster={cluster} />

          <Separator />

          {SHOW_COMPARISON_SECTION && (
            <>
              <ComparisonSection
                status={status}
                comparison={data?.comparison ?? []}
                onRetry={onRetry}
              />
              <Separator />
            </>
          )}

          <ContentBucketsSection
            status={status}
            buckets={data?.contentBuckets ?? []}
            onRetry={onRetry}
          />

          <Separator />

          <div className="text-xs text-muted-foreground">
            Sumber: data mart internal (D-1) · data ilustrasi
          </div>
        </div>
      )}
    </PageContainer>
  );
}
