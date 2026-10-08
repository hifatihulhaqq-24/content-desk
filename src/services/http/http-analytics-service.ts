import type {
  AccountAnalyticsData,
  AccountSummary,
  BuildingBlockData,
  BuildingBlockQuery,
  ContentTypeData,
  ContentTypeQuery,
  DateRangeQuery,
  OverviewData,
  Paged,
  PlatformAnalyticsData,
  PlatformId,
  Post,
  PostFilter,
  PublishingTimeData,
  PublishingTimeQuery,
} from "@/types/analytics";
import type { AnalyticsService } from "../analytics-service";

const NOT_IMPLEMENTED =
  "API Back End belum terintegrasi. Set env NEXT_PUBLIC_USE_MOCK=true untuk menggunakan mock data.";

/**
 * Placeholder integrasi fase berikutnya. Setiap method akan diimplementasikan
 * memakai HTTP client terhadap endpoint di docs/api-contract.md —
 * cukup ganti isi method tanpa mengubah komponen UI.
 */
export class HttpAnalyticsService implements AnalyticsService {
  getOverview(_query: DateRangeQuery): Promise<OverviewData> {
    return Promise.reject(new Error(NOT_IMPLEMENTED));
  }

  getPlatformAnalytics(
    _platform: PlatformId,
    _query: DateRangeQuery
  ): Promise<PlatformAnalyticsData> {
    return Promise.reject(new Error(NOT_IMPLEMENTED));
  }

  getPlatformAccounts(
    _platform: PlatformId,
    _query: DateRangeQuery
  ): Promise<AccountSummary[]> {
    return Promise.reject(new Error(NOT_IMPLEMENTED));
  }

  getAccountAnalytics(
    _accountId: string,
    _query: DateRangeQuery
  ): Promise<AccountAnalyticsData> {
    return Promise.reject(new Error(NOT_IMPLEMENTED));
  }

  getAccountPosts(_filter: PostFilter): Promise<Paged<Post>> {
    return Promise.reject(new Error(NOT_IMPLEMENTED));
  }

  getPublishingTime(
    _query: PublishingTimeQuery
  ): Promise<PublishingTimeData> {
    return Promise.reject(new Error(NOT_IMPLEMENTED));
  }

  getContentTypeAnalysis(
    _query: ContentTypeQuery
  ): Promise<ContentTypeData> {
    return Promise.reject(new Error(NOT_IMPLEMENTED));
  }

  getBuildingBlockAnalysis(
    _query: BuildingBlockQuery
  ): Promise<BuildingBlockData> {
    return Promise.reject(new Error(NOT_IMPLEMENTED));
  }
}
