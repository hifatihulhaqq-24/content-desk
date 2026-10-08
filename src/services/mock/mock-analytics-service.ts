import type {
  AccountAnalyticsData,
  AccountSummary,
  BuildingBlockData,
  BuildingBlockQuery,
  ContentTypeData,
  ContentTypeQuery,
  DateRangeQuery,
  OverviewData,
  OverviewQuery,
  Paged,
  PlatformAnalyticsData,
  PlatformId,
  Post,
  PostFilter,
  PublishingTimeData,
  PublishingTimeQuery,
} from "@/types/analytics";
import type { AnalyticsService } from "../analytics-service";
import { getDemoState } from "../demo-state";
import { computeOverview } from "./compute-overview";
import { computePlatformAnalytics } from "./compute-platform";
import {
  computeAccountAnalytics,
  computeAccountSummaries,
} from "./compute-account";
import { computeAccountPosts } from "./compute-posts";
import { computePublishingTime } from "./publishing-time";
import { computeContentType } from "./content-type";
import { computeBuildingBlock } from "./building-block";
import {
  emptyAccountAnalytics,
  emptyBuildingBlock,
  emptyContentType,
  emptyOverview,
  emptyPlatformAnalytics,
  emptyPosts,
  emptyPublishingTime,
  emptySummaries,
} from "./empty";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function simulate<T>(options: {
  produce: () => T;
  empty: () => T;
}): Promise<T> {
  const state = getDemoState();
  if (state === "loading") {
    await new Promise<never>(() => {});
  }
  await sleep(300 + Math.random() * 500);
  if (state === "error") {
    throw new Error(
      "Gagal memuat data analitik. Silakan coba lagi beberapa saat lagi."
    );
  }
  if (state === "empty") return options.empty();
  return options.produce();
}

export class MockAnalyticsService implements AnalyticsService {
  getOverview(query: OverviewQuery): Promise<OverviewData> {
    return simulate({ produce: () => computeOverview(query), empty: emptyOverview });
  }

  getPlatformAnalytics(
    platform: PlatformId,
    query: DateRangeQuery
  ): Promise<PlatformAnalyticsData> {
    return simulate({
      produce: () => computePlatformAnalytics(platform, query),
      empty: () => emptyPlatformAnalytics(platform),
    });
  }

  getPlatformAccounts(
    platform: PlatformId,
    query: DateRangeQuery
  ): Promise<AccountSummary[]> {
    return simulate({
      produce: () => computeAccountSummaries(platform, query),
      empty: () => emptySummaries(platform),
    });
  }

  getAccountAnalytics(
    accountId: string,
    query: DateRangeQuery
  ): Promise<AccountAnalyticsData> {
    return simulate({
      produce: () => {
        const data = computeAccountAnalytics(accountId, query);
        if (!data) throw new Error("Akun tidak ditemukan.");
        return data;
      },
      empty: () => {
        const data = emptyAccountAnalytics(accountId);
        if (!data) throw new Error("Akun tidak ditemukan.");
        return data;
      },
    });
  }

  getAccountPosts(filter: PostFilter): Promise<Paged<Post>> {
    return simulate({
      produce: () => computeAccountPosts(filter),
      empty: () => emptyPosts(filter.page, filter.pageSize),
    });
  }

  getPublishingTime(query: PublishingTimeQuery): Promise<PublishingTimeData> {
    return simulate({
      produce: () => computePublishingTime(query),
      empty: emptyPublishingTime,
    });
  }

  getContentTypeAnalysis(query: ContentTypeQuery): Promise<ContentTypeData> {
    return simulate({
      produce: () => computeContentType(query),
      empty: emptyContentType,
    });
  }

  getBuildingBlockAnalysis(
    query: BuildingBlockQuery
  ): Promise<BuildingBlockData> {
    return simulate({
      produce: () => computeBuildingBlock(query),
      empty: emptyBuildingBlock,
    });
  }
}
