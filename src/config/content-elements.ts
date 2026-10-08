import type { BuildingBlockId, ContentFormat } from "@/types/analytics";

/** Urutan segmen Content Type Analysis. */
export const CONTENT_FORMATS: ContentFormat[] = [
  "Single Image",
  "Video",
  "Carousel",
];

/** Warna segmen donut per format (selaras seri chart --chart-1/2/3). */
export const CONTENT_FORMAT_COLORS: Record<ContentFormat, string> = {
  "Single Image": "var(--color-chart-1)",
  Video: "var(--color-chart-2)",
  Carousel: "var(--color-chart-3)",
};

/** Urutan Building Block Analysis (Top 5). */
export const BUILDING_BLOCKS: BuildingBlockId[] = [
  "svt",
  "svl",
  "onliner",
  "carousel",
  "vidol",
];

export const BUILDING_BLOCK_LABELS: Record<BuildingBlockId, string> = {
  svt: "SVT",
  svl: "SVL",
  onliner: "ONLINER",
  carousel: "CAROUSEL",
  vidol: "VIDOL",
};
