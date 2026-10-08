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

/**
 * Kontrak data tunggal untuk seluruh halaman analytics.
 * Fase 1: MockAnalyticsService. Fase integrasi: HttpAnalyticsService
 * mengimplementasikan interface yang sama — komponen UI tidak berubah.
 */
export interface AnalyticsService {
  getOverview(query: OverviewQuery): Promise<OverviewData>;
  getPlatformAnalytics(
    platform: PlatformId,
    query: DateRangeQuery
  ): Promise<PlatformAnalyticsData>;
  getPlatformAccounts(
    platform: PlatformId,
    query: DateRangeQuery
  ): Promise<AccountSummary[]>;
  getAccountAnalytics(
    accountId: string,
    query: DateRangeQuery
  ): Promise<AccountAnalyticsData>;
  getAccountPosts(filter: PostFilter): Promise<Paged<Post>>;
  /** Distribusi konten/tayangan/interaksi per jam (Publishing Time Analysis). */
  getPublishingTime(query: PublishingTimeQuery): Promise<PublishingTimeData>;
  /** Distribusi per tipe konten — Single Image/Video/Carousel. */
  getContentTypeAnalysis(query: ContentTypeQuery): Promise<ContentTypeData>;
  /** Top 5 building block konten (SVT/SVL/ONLINER/CAROUSEL/VIDOL). */
  getBuildingBlockAnalysis(
    query: BuildingBlockQuery
  ): Promise<BuildingBlockData>;
}
