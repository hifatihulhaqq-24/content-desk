"use client";

import { useState } from "react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { ErrorState } from "@/components/data/states";
import { Separator } from "@/components/ui/separator";
import { getQueryUiState, useOverview } from "@/hooks/use-analytics";
import {
  ALL_CLUSTERS,
  type ClusterFilter as ClusterFilterValue,
} from "@/config/clusters";
import { ClusterFilter } from "./cluster-filter";
import { ComparisonSection } from "./comparison-section";
import { ContentBucketsSection } from "./content-buckets-section";
import { ContentTypeSection } from "./content-type-section";
import { BuildingBlockSection } from "./building-block-section";
import { KpiSection } from "./kpi-section";
import { overviewIsEmpty } from "./overview-helpers";
import { PlatformSummarySection } from "./platform-summary-section";
import { PublishingTimeSection } from "./publishing-time-section";
import { TopArticlesSection } from "./top-articles-section";
import { TopPlatformSection } from "./top-platform-section";
import { TopicRecommendationSection } from "./topic-recommendation-section";
import { WebPerformanceSection } from "./web-performance-section";

/** Sembunyikan Perbandingan Platform tanpa menghapus komponen/kontraknya. */
const SHOW_COMPARISON_SECTION = false;

export function OverviewView() {
  const [cluster, setCluster] = useState<ClusterFilterValue>(ALL_CLUSTERS);
  const query = useOverview(cluster);
  const status = getQueryUiState(query, overviewIsEmpty);
  const data = query.data;
  const onRetry = () => void query.refetch();

  return (
    <PageContainer>
      <PageHeader
        title="Overview"
        description="Ringkasan performa seluruh platform dalam satu layar."
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
            onRetry={onRetry}
          />

          <Separator />

          <PlatformSummarySection
            status={status}
            summaries={data?.platformSummaries ?? []}
            onRetry={onRetry}
          />

          <Separator />

          <div className="grid items-start gap-4 lg:grid-cols-2">
            <PublishingTimeSection cluster={cluster} />
            <TopPlatformSection
              status={status}
              summaries={data?.platformSummaries ?? []}
              onRetry={onRetry}
            />
          </div>

          <Separator />

          <div className="grid items-start gap-4 lg:grid-cols-2">
            <ContentTypeSection cluster={cluster} />
            <BuildingBlockSection cluster={cluster} />
          </div>

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

          <WebPerformanceSection
            status={status}
            stats={
              data?.webStats ?? { kpis: [], points: [] }
            }
            onRetry={onRetry}
          />

          <Separator />

          <TopArticlesSection
            status={status}
            articles={data?.topArticles ?? []}
            onRetry={onRetry}
          />
        </div>
      )}
    </PageContainer>
  );
}
