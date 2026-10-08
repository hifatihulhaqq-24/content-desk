import { listDays } from "@/lib/date";
import { VISIBLE_PLATFORMS } from "@/config/platforms";
import type { HeatmapCell, TrendPoint } from "@/types/analytics";

/** Periode tetap (tanpa Date.now) agar aman untuk prerender. */
const DEMO_RANGE = {
  from: new Date(2026, 8, 1),
  to: new Date(2026, 8, 30),
};

export const DEMO_DAYS = listDays(DEMO_RANGE);

export const DEMO_TREND: TrendPoint[] = DEMO_DAYS.map((date, index) => ({
  date,
  reach: 8_000 + ((index * 137) % 4_200),
  impressions: 12_000 + ((index * 311) % 6_400),
  engagement: 600 + ((index * 53) % 480),
}));

export const DEMO_TREND_PREVIOUS: TrendPoint[] = DEMO_DAYS.map(
  (date, index) => ({
    date,
    reach: 7_400 + ((index * 119) % 3_600),
    impressions: 11_200 + ((index * 277) % 5_800),
    engagement: 540 + ((index * 41) % 420),
  })
);

export const DEMO_SPARKLINE = Array.from(
  { length: 30 },
  (_, index) => 12_000 + ((index * 173) % 4_000)
);

export const DEMO_PLATFORM_BARS = [
  { label: "Instagram", value: 124_500 },
  { label: "TikTok", value: 98_300 },
  { label: "YouTube", value: 76_800 },
  { label: "Facebook", value: 54_100 },
];

export const DEMO_PLATFORM_BAR_COLORS = Object.fromEntries(
  VISIBLE_PLATFORMS.map((platform) => [platform.name, platform.color])
);

export const DEMO_STACKED_ROWS = [
  { name: "Instagram", Reels: 42_000, Carousel: 28_000, Image: 14_000 },
  { name: "TikTok", Reels: 51_000, Carousel: 9_000, Image: 6_000 },
  { name: "YouTube", Reels: 33_000, Carousel: 12_000, Image: 4_000 },
  { name: "Facebook", Reels: 18_000, Carousel: 21_000, Image: 15_000 },
];

export const DEMO_DONUT = DEMO_PLATFORM_BARS.map((item) => ({
  label: item.label,
  value: item.value,
}));

export const DEMO_HEATMAP_CELLS: HeatmapCell[] = [];
for (let day = 0; day < 7; day += 1) {
  for (let hour = 0; hour < 24; hour += 1) {
    const evening = hour >= 18 && hour <= 21 ? 55 : 0;
    const lunch = hour >= 12 && hour <= 13 ? 35 : 0;
    const weekend = day >= 5 ? 15 : 0;
    const noise = (day * 7 + hour * 13) % 12;
    DEMO_HEATMAP_CELLS.push({
      day,
      hour,
      value: 10 + evening + lunch + weekend + noise,
    });
  }
}

export interface DemoPostRow {
  id: string;
  caption: string;
  platform: "instagram" | "tiktok" | "youtube" | "facebook";
  type: string;
  reach: number;
  engagementRate: number;
}

export const DEMO_POST_ROWS: DemoPostRow[] = [
  { id: "p1", caption: "Behind the scene studio kopi", platform: "instagram", type: "Reels", reach: 42_300, engagementRate: 5.8 },
  { id: "p2", caption: "Resep es kopi susu gula aren", platform: "tiktok", type: "Video", reach: 61_800, engagementRate: 7.2 },
  { id: "p3", caption: "Tur dapur roastery kami", platform: "youtube", type: "Video", reach: 28_900, engagementRate: 4.1 },
  { id: "p4", caption: "Promo payday 20%", platform: "facebook", type: "Image", reach: 19_400, engagementRate: 3.4 },
  { id: "p5", caption: "Cerita mitra petani Gayo", platform: "facebook", type: "Link", reach: 16_700, engagementRate: 2.9 },
  { id: "p6", caption: "Collab bareng barista champion", platform: "instagram", type: "Carousel", reach: 38_100, engagementRate: 6.3 },
  { id: "p7", caption: "Review alat seduh terbaru", platform: "tiktok", type: "Video", reach: 47_600, engagementRate: 6.8 },
  { id: "p8", caption: "Menu musiman: aren latte", platform: "instagram", type: "Reels", reach: 33_500, engagementRate: 5.1 },
  { id: "p9", caption: "Q&A seputar kopi single origin", platform: "youtube", type: "Short", reach: 22_100, engagementRate: 4.7 },
  { id: "p10", caption: "Foto komunitas cupping", platform: "facebook", type: "Photo", reach: 9_800, engagementRate: 2.4 },
  { id: "p11", caption: "Giveaway 1kg beans gratis", platform: "youtube", type: "Short", reach: 15_300, engagementRate: 3.8 },
  { id: "p12", caption: "Reels: 30 detik latte art", platform: "instagram", type: "Reels", reach: 55_900, engagementRate: 7.5 },
];
