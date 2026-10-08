"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type {
  AccountAnalyticsData,
  AccountSummary,
  OverviewData,
  Paged,
  PlatformAnalyticsData,
  PlatformId,
  Post,
  PostFilter,
  PublishingTimeData,
} from "@/types/analytics";
import { getAnalyticsService } from "@/services";
import { useDateRange } from "./use-date-range";

export function useOverview(cluster: string) {
  const { query, ready } = useDateRange();
  return useQuery({
    queryKey: ["overview", query, cluster],
    queryFn: () => getAnalyticsService().getOverview({ ...query, cluster }),
    enabled: ready,
  });
}

export function usePlatformAnalytics(platform: PlatformId) {
  const { query, ready } = useDateRange();
  return useQuery({
    queryKey: ["platform-analytics", platform, query],
    queryFn: () => getAnalyticsService().getPlatformAnalytics(platform, query),
    enabled: ready,
  });
}

export function usePlatformAccounts(platform: PlatformId) {
  const { query, ready } = useDateRange();
  return useQuery({
    queryKey: ["platform-accounts", platform, query],
    queryFn: () => getAnalyticsService().getPlatformAccounts(platform, query),
    enabled: ready,
  });
}

export function useAccountAnalytics(accountId: string) {
  const { query, ready } = useDateRange();
  return useQuery({
    queryKey: ["account-analytics", accountId, query],
    queryFn: () => getAnalyticsService().getAccountAnalytics(accountId, query),
    enabled: ready,
  });
}

export type AccountPostsParams = Omit<PostFilter, "accountId">;

export interface Scope {
  platform: PlatformId | "all";
  accountId: string;
  cluster: string;
}

export function usePublishingTime(scope: Scope) {
  const { query, ready } = useDateRange();
  return useQuery({
    queryKey: ["publishing-time", query, scope],
    queryFn: () =>
      getAnalyticsService().getPublishingTime({ ...query, ...scope }),
    enabled: ready,
  });
}

export function useContentType(scope: Scope) {
  const { query, ready } = useDateRange();
  return useQuery({
    queryKey: ["content-type", query, scope],
    queryFn: () =>
      getAnalyticsService().getContentTypeAnalysis({ ...query, ...scope }),
    enabled: ready,
  });
}

export function useBuildingBlock(scope: Scope) {
  const { query, ready } = useDateRange();
  return useQuery({
    queryKey: ["building-block", query, scope],
    queryFn: () =>
      getAnalyticsService().getBuildingBlockAnalysis({ ...query, ...scope }),
    enabled: ready,
  });
}

export function useAccountPosts(
  accountId: string,
  params: AccountPostsParams
) {
  return useQuery({
    queryKey: [
      "account-posts",
      accountId,
      params.from,
      params.to,
      params.type ?? "all",
      params.search ?? "",
      params.sortKey ?? "publishedAt",
      params.sortDir ?? "desc",
      params.page,
      params.pageSize,
    ],
    queryFn: () =>
      getAnalyticsService().getAccountPosts({ ...params, accountId }),
  });
}

export type QueryUiState = "loading" | "error" | "empty" | "success";

export function getQueryUiState<T>(
  query: UseQueryResult<T, Error>,
  isEmpty?: (data: T) => boolean
): QueryUiState {
  if (query.isPending) return "loading";
  if (query.isError) return "error";
  if (query.data !== undefined && isEmpty?.(query.data)) return "empty";
  return "success";
}

export type {
  OverviewData,
  PlatformAnalyticsData,
  AccountAnalyticsData,
  AccountSummary,
  Paged,
  Post,
  PublishingTimeData,
};
