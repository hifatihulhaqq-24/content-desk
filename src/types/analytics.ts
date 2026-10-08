import type { MetricFormat } from "@/config/metrics";
import type { ClusterId } from "@/config/clusters";
import type { PlatformId } from "@/config/platforms";

export type { PlatformId };
export type { MetricFormat };
export type { ClusterId };

/** Rentang tanggal ISO (yyyy-MM-dd) — kontrak yang diterima service layer. */
export interface DateRangeQuery {
  from: string;
  to: string;
}

/** Query halaman Overview — date range + filter cluster ("all" bila tidak ada). */
export interface OverviewQuery extends DateRangeQuery {
  cluster?: string;
}

export type ConnectionStatus = "connected" | "syncing" | "error";

export interface KpiMetric {
  key: string;
  label: string;
  value: number;
  previousValue: number | null;
  /** Persentase perubahan vs periode sebelumnya; null bila tidak tersedia. */
  deltaPercent: number | null;
  format: MetricFormat;
}

export interface TrendPoint {
  date: string;
  [metricKey: string]: string | number;
}

export interface TrendResult {
  points: TrendPoint[];
  /** Titik tren periode sebelumnya (untuk perbandingan). */
  previous: TrendPoint[];
}

/** Metrik Publishing Time Analysis yang bisa dipilih. */
export type PublishingMetric = "content" | "views" | "engagements";

/** Titik Publishing Time Analysis pada satu jam dalam window 07.00–21.00. */
export interface PublishingHourPoint {
  hour: number;
  /** Label sumbu X, mis. "19.00". */
  label: string;
  /** Jumlah konten terbit pada jam ini. */
  content: number;
  views: number;
  engagements: number;
}

/**
 * Query umum section berbasis cakupan platform/akun
 * (Publishing Time, Content Type, Building Block).
 */
export interface ScopeQuery extends DateRangeQuery {
  cluster?: string;
  /** "all" bila tidak difilter. */
  platform?: PlatformId | "all";
  /** "all" bila seluruh akun pada cakupan. */
  accountId?: string | "all";
}

export type PublishingTimeQuery = ScopeQuery;

export interface PublishingTimeData {
  points: PublishingHourPoint[];
  totals: {
    content: number;
    views: number;
    engagements: number;
  };
}

/** Tipe konten untuk Content Type Analysis. */
export type ContentFormat = "Gambar" | "Video" | "Carousel";

/** Metrik yang bisa dipilih di Content Type Analysis. */
export type ContentTypeMetric =
  | "content"
  | "views"
  | "engagements"
  | "newFollowers";

export interface ContentTypePoint {
  format: ContentFormat;
  content: number;
  views: number;
  engagements: number;
  newFollowers: number;
}

export interface ContentTypeData {
  formats: ContentTypePoint[];
  totals: {
    content: number;
    views: number;
    engagements: number;
    newFollowers: number;
  };
}

export type ContentTypeQuery = ScopeQuery;

/** Elemen pembentuk konten untuk Building Block Analysis. */
export type BuildingBlockId = "svt" | "svl" | "onliner" | "carousel" | "vidol";

/** Metrik yang bisa dipilih di Building Block Analysis. */
export type BuildingBlockMetric =
  | "content"
  | "views"
  | "viewsPerContent"
  | "engagements"
  | "engagementsPerContent";

export interface BuildingBlockPoint {
  block: BuildingBlockId;
  content: number;
  views: number;
  viewsPerContent: number;
  engagements: number;
  engagementsPerContent: number;
}

export interface BuildingBlockData {
  /** Maksimal 5 block (Top 5) — UI mengurutkan ulang per metrik terpilih. */
  blocks: BuildingBlockPoint[];
}

export type BuildingBlockQuery = ScopeQuery;

export interface PlatformSummary {
  platform: PlatformId;
  name: string;
  color: string;
  views: number;
  /** Kontribusi tayangan terhadap total seluruh platform (%). */
  viewsSharePercent: number;
  /** Kenaikan tayangan dibanding periode sebelumnya (%). */
  viewsGrowthPercent: number | null;
  engagement: number;
  engagementRate: number | null;
  posts: number;
}

export interface PlatformComparisonPoint {
  platform: PlatformId;
  name: string;
  color: string;
  /** Nilai terakumulasi per metrik pada periode berjalan. */
  metrics: Record<string, number>;
}

export interface ContentBreakdownItem {
  label: string;
  count: number;
  avgEngagement: number;
}

export type PostType = string;

export interface Post {
  id: string;
  accountId: string;
  platform: PlatformId;
  cluster: ClusterId;
  type: PostType;
  /** Tipe konten terstruktur (Content Type Analysis). */
  format: ContentFormat;
  /** Elemen pembentuk konten (Building Block Analysis). */
  buildingBlock: BuildingBlockId;
  caption: string;
  /** ISO datetime. */
  publishedAt: string;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    reach: number;
    impressions: number;
    engagementRate: number;
    views: number;
    /** Followers baru yang berasal dari konten ini (mock). */
    newFollowers: number;
  };
}

export interface AccountSummary {
  id: string;
  platform: PlatformId;
  name: string;
  handle: string;
  status: ConnectionStatus;
  lastSyncedAt: string;
  followers: number;
  followersGrowthPercent: number | null;
  engagementRate: number | null;
  posts: number;
}

export type ContentBucketKey = "breakout" | "growing" | "lowLight";

export interface ContentBucket {
  key: ContentBucketKey;
  label: string;
  description: string;
  /** Median views konten pada periode — dasar ambang klasifikasi. */
  medianViews: number;
  posts: Post[];
}

export interface ArticleSummary {
  id: string;
  title: string;
  publishedAt: string;
  pv: number;
  impressions: number;
  engagementRate: number;
}

export interface TopicRecommendation {
  id: string;
  title: string;
  contentCount: number;
  /** Total tayangan topik pada periode ini. */
  views: number;
  /** Skor rekomendasi 0–100. */
  score: number;
}

export interface WebStats {
  kpis: KpiMetric[];
  points: TrendPoint[];
}

export interface OverviewData {
  kpis: KpiMetric[];
  trend: TrendResult;
  comparison: PlatformComparisonPoint[];
  platformSummaries: PlatformSummary[];
  contentBuckets: ContentBucket[];
  webStats: WebStats;
  topArticles: ArticleSummary[];
  topicRecommendations: TopicRecommendation[];
}

export interface PlatformAnalyticsData {
  platform: PlatformId;
  kpis: KpiMetric[];
  trend: TrendResult;
  contentTypeBreakdown: ContentBreakdownItem[];
  topPosts: Post[];
}

export interface AccountAnalyticsData {
  account: AccountSummary;
  kpis: KpiMetric[];
  trend: TrendResult;
  contentOverview: ContentBreakdownItem[];
  audience: AudienceBreakdown;
}

export interface AudienceBreakdown {
  genders: { label: string; value: number }[];
  ageRanges: { label: string; value: number }[];
  locations: { label: string; value: number }[];
}

export interface HeatmapCell {
  day: number;
  hour: number;
  value: number;
}

export interface PostFilter extends DateRangeQuery {
  accountId: string;
  type?: string;
  search?: string;
  sortKey?: string;
  sortDir?: "asc" | "desc";
  page: number;
  pageSize: number;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type AudienceData = AudienceBreakdown;
