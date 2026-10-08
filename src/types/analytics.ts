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
  /** Filter tagging untuk section Data Platform ("all" bila tidak difilter). */
  tagging?: string;
}

export type ConnectionStatus = "connected" | "syncing" | "error";

export interface KpiMetric {
  key: string;
  label: string;
  value: number;
  previousValue: number | null;
  /** Persentase perubahan vs periode sebelumnya; null bila tidak tersedia. */
  deltaPercent: number | null;
  /**
   * Satuan delta: "percent" (relatif %) atau "pp" (percentage point,
   * untuk metrik format percent seperti Engagement Rate).
   */
  deltaUnit?: "percent" | "pp";
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
  impressions: number;
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
  /**
   * Pilihan multi-platform (chips). Kosong = semua platform.
   * Bila terisi, dipakai sebagai filter utama (menggantikan `platform`).
   */
  platforms?: PlatformId[];
  /** "all" bila seluruh akun pada cakupan. */
  accountId?: string | "all";
}

export type PublishingTimeQuery = ScopeQuery;

export interface PublishingTimeData {
  points: PublishingHourPoint[];
  totals: {
    content: number;
    impressions: number;
    engagements: number;
  };
}

/** Tipe konten untuk Content Type Analysis. */
export type ContentFormat = "Single Image" | "Video" | "Carousel";

export interface ContentTypePoint {
  format: ContentFormat;
  content: number;
  impressions: number;
  engagements: number;
}

export interface ContentTypeData {
  formats: ContentTypePoint[];
  totals: {
    content: number;
    impressions: number;
    engagements: number;
  };
}

export type ContentTypeQuery = ScopeQuery;

/** Elemen pembentuk konten untuk Building Block Analysis. */
export type BuildingBlockId = "svt" | "svl" | "onliner" | "carousel" | "vidol";

export interface BuildingBlockPoint {
  block: BuildingBlockId;
  content: number;
  impressions: number;
  engagements: number;
  /** Engagement / reach × 100 pada block ini. */
  engagementRate: number | null;
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
  impressions: number;
  /** Kontribusi impression terhadap total seluruh platform (%). */
  impressionsSharePercent: number;
  /** Kenaikan impression dibanding periode sebelumnya (%). */
  impressionsGrowthPercent: number | null;
  engagement: number;
  engagementRate: number | null;
  posts: number;
  /** Kontribusi jumlah konten terhadap total seluruh platform (%). */
  postsSharePercent: number;
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
  /** Label tagging konten (filter Data Platform). */
  tagging: string;
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

export type ContentBucketKey = "highlight" | "lowLight";

export interface ContentBucket {
  key: ContentBucketKey;
  label: string;
  description: string;
  /** Median impression konten pada periode — dasar ambang klasifikasi. */
  medianImpressions: number;
  posts: Post[];
}

/** Pita distribusi pada kartu Median (di bawah / sesuai / di atas standar). */
export interface MedianBucket {
  key: "below" | "normal" | "above";
  label: string;
  /** Aturan ambang, mis. "< 0,7× standar". */
  rule: string;
  count: number;
}

/** Insight Median per konten (Impression & Engagement). */
export interface MedianInsight {
  key: "impressions" | "engagements";
  label: string;
  /** Nilai tengah per konten pada periode berjalan. */
  median: number;
  /** Standar cluster (threshold eksternal — contract dari BE). */
  threshold: number;
  /** median / threshold, mis. 1,1. */
  ratioToThreshold: number;
  /** Jumlah konten sampel pada periode berjalan. */
  sampleSize: number;
  buckets: MedianBucket[];
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
  /** Median Impression & Engagement per konten + ambang standar cluster. */
  medians: MedianInsight[];
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
