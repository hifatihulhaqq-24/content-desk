import type { BuildingBlockId, ContentFormat } from "@/types/analytics";

/** Urutan segmen Content Type Analysis (mock kumparanDesk — PRODUCT MVP). */
export const CONTENT_FORMATS: ContentFormat[] = [
  "TikTok Video",
  "YouTube Full Video",
  "Instagram Reels Video",
  "Facebook Video",
  "Facebook Link",
  "Lainnya",
];

/**
 * Palet shade 6 warna per metrik untuk donut Content Type Analysis —
 * persis mock kumparanDesk — PRODUCT MVP (biru / teal / orange).
 * Warna literal (bukan var) agar pasti ter-render di SVG recharts.
 */
export const DONUT_PALETTES: Record<
  "content" | "impressions" | "engagements",
  string[]
> = {
  // Total konten — shade biru.
  content: ["#1E3A8A", "#1D4ED8", "#3B82F6", "#60A5FA", "#93C5FD", "#DBEAFE"],
  // Impression — shade teal.
  impressions: ["#134E4A", "#0F766E", "#14B8A6", "#5EEAD4", "#99F6E4", "#CCFBF1"],
  // Engagement — shade orange.
  engagements: ["#7C2D12", "#C2410C", "#F97316", "#FB923C", "#FDBA74", "#FFEDD5"],
};

/**
 * Urutan Building Block Analysis — 10 elemen (Top 10, urut render
 * diatur oleh UI: Impression desc).
 */
export const BUILDING_BLOCKS: BuildingBlockId[] = [
  "vidol",
  "svt",
  "carousel",
  "svl",
  "onliner",
  "infografis",
  "explainer",
  "liveReport",
  "quote",
  "polling",
];

export const BUILDING_BLOCK_LABELS: Record<BuildingBlockId, string> = {
  vidol: "VIDOL",
  svt: "SVT",
  carousel: "CAROUSEL",
  svl: "SVL",
  onliner: "ONLINER",
  infografis: "INFOGRAFIS",
  explainer: "EXPLAINER",
  liveReport: "LIVE REPORT",
  quote: "QUOTE",
  polling: "POLLING",
};
