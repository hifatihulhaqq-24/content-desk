export type MetricFormat =
  | "number"
  | "percent"
  | "hours"
  | "duration"
  | "decimal";

export interface MetricDef {
  key: string;
  label: string;
  format: MetricFormat;
  description?: string;
}

/**
 * Katalog metrik terpusat. Semua chart/table memformat angka
 * berdasarkan definisi ini agar konsisten antar halaman.
 */
export const METRICS: Record<string, MetricDef> = {
  followers: {
    key: "followers",
    label: "Followers",
    format: "number",
    description: "Jumlah followers di akhir periode",
  },
  followersGrowth: {
    key: "followersGrowth",
    label: "Pertumbuhan Followers",
    format: "number",
    description: "Selisih followers dibanding hari sebelum periode",
  },
  reach: { key: "reach", label: "Reach", format: "number" },
  impressions: { key: "impressions", label: "Impressions", format: "number" },
  engagement: { key: "engagement", label: "Engagement", format: "number" },
  engagementRate: {
    key: "engagementRate",
    label: "Engagement Rate",
    format: "percent",
    description: "Engagement dibagi reach",
  },
  likes: { key: "likes", label: "Likes", format: "number" },
  comments: { key: "comments", label: "Comments", format: "number" },
  shares: { key: "shares", label: "Shares", format: "number" },
  saves: { key: "saves", label: "Saves", format: "number" },
  clicks: { key: "clicks", label: "Link Clicks", format: "number" },
  profileVisits: {
    key: "profileVisits",
    label: "Profile Visits",
    format: "number",
  },
  views: { key: "views", label: "Views", format: "number" },
  watchTime: {
    key: "watchTime",
    label: "Watch Time",
    format: "hours",
    description: "Total jam tayang",
  },
  avgViewDuration: {
    key: "avgViewDuration",
    label: "Avg View Duration",
    format: "duration",
    description: "Rata-rata durasi tayang per view",
  },
  impressionsCtr: {
    key: "impressionsCtr",
    label: "Impressions CTR",
    format: "percent",
  },
  posts: { key: "posts", label: "Total Post", format: "number" },
  pv: { key: "pv", label: "Page Views", format: "number" },
  uniqueVisitors: {
    key: "uniqueVisitors",
    label: "Unique Visitors",
    format: "number",
  },
};

export function getMetric(key: string): MetricDef {
  return METRICS[key] ?? { key, label: key, format: "number" };
}
