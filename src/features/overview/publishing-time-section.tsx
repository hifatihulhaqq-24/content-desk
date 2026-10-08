"use client";

import { useState } from "react";
import { HourBarChart } from "@/components/data/hour-bar-chart";
import { PlatformChips } from "./platform-chips";
import type { PlatformId } from "@/types/analytics";
import { formatCompact, formatNumber } from "@/lib/format";

interface ChartSpec {
  title: string;
  values: number[];
  formatAxis: (value: number) => string;
  formatValue: (value: number) => string;
  lightColor: string;
  darkColor: string;
}

const HOURS = Array.from({ length: 24 }, (_, index) => index); // 00–23

/**
 * Data dummy statis (mock kumparanDesk — Product MVP) — tidak pernah kosong.
 * 24 titik untuk 00.00–23.00; deret 07–21 memakai angka mock, sisanya jam
 * sepi yang tetap > 0.
 */
const DUMMY_CONTENT = [
  3, 2, 1, 1, 2, 4, 7, 11, 18, 10, 8, 9, 10, 9, 8, 9, 15, 9, 10, 12, 20, 12,
  9, 5,
];
const DUMMY_IMPRESSIONS = [
  0.5, 0.4, 0.3, 0.3, 0.5, 0.8, 1.2, 1.6, 2.9, 1.8, 1.4, 1.5, 1.7, 1.5, 1.3,
  1.6, 2.6, 1.7, 2.0, 2.4, 3.6, 2.3, 1.7, 1.0,
].map((value) => Math.round(value * 1_000_000));
const DUMMY_ENGAGEMENTS = [
  14, 11, 8, 8, 13, 22, 33, 46, 82, 51, 40, 44, 49, 43, 38, 47, 75, 49, 57, 70,
  104, 66, 48, 27,
].map((value) => value * 1_000);

/**
 * Share kontribusi impression per platform (dari Data Platform mock).
 * Dipakai untuk men-scale data dummy saat platform difilter — semua share
 * > 0 sehingga chart tidak pernah kosong.
 */
const PLATFORM_SHARE: Record<string, number> = {
  instagram: 0.229,
  tiktok: 0.293,
  youtube: 0.209,
  facebook: 0.268,
  x: 0.04,
};

function scaleFor(platforms: PlatformId[]): number {
  if (platforms.length === 0) return 1;
  const total = platforms.reduce(
    (sum, id) => sum + (PLATFORM_SHARE[id] ?? 0.25),
    0
  );
  // Minimal 12% supaya nilai selalu terlihat & tidak pernah 0.
  return Math.max(0.12, total);
}

/**
 * Publishing Time Analysis — satu card berisi 3 chart per jam
 * (Total konten, Impression, Engagement) memakai data dummy statis
 * sesuai mock kumparanDesk — PRODUCT MVP: tidak ada state kosong.
 */
export function PublishingTimeSection() {
  const [platforms, setPlatforms] = useState<PlatformId[]>([]);
  const scale = scaleFor(platforms);

  const charts: ChartSpec[] = [
    {
      title: "Total konten",
      values: DUMMY_CONTENT.map((value) =>
        Math.max(1, Math.round(value * scale))
      ),
      formatAxis: (value) => formatCompact(value),
      formatValue: (value) => `${formatNumber(value)} konten`,
      lightColor: "var(--chart-content-soft)",
      darkColor: "var(--chart-content-dark)",
    },
    {
      title: "Impression",
      values: DUMMY_IMPRESSIONS.map((value) =>
        Math.max(1, Math.round(value * scale))
      ),
      formatAxis: (value) => formatCompact(value),
      formatValue: (value) => formatCompact(value),
      lightColor: "var(--chart-impressions-soft)",
      darkColor: "var(--chart-impressions-dark)",
    },
    {
      title: "Engagement",
      values: DUMMY_ENGAGEMENTS.map((value) =>
        Math.max(1, Math.round(value * scale))
      ),
      formatAxis: (value) => formatCompact(value),
      formatValue: (value) => formatCompact(value),
      lightColor: "var(--chart-engagements-soft)",
      darkColor: "var(--chart-engagements-dark)",
    },
  ];

  return (
    <section className="flex flex-col gap-3.5 rounded-xl bg-card p-4 text-card-foreground shadow-xs md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[17px] font-bold">Publishing Time Analysis</h2>
          <p className="text-[13px] text-muted-foreground">
            Per jam tayang, 00.00–23.00 · 3 jam terbaik ditandai warna gelap
          </p>
        </div>
        <PlatformChips value={platforms} onChange={setPlatforms} />
      </div>

      <div className="grid gap-5 min-[1100px]:grid-cols-3">
        {charts.map((chart) => (
          <HourBarChart
            key={chart.title}
            title={chart.title}
            data={HOURS.map((hour, index) => ({
              hour,
              value: chart.values[index] ?? 1,
            }))}
            formatAxis={chart.formatAxis}
            formatValue={chart.formatValue}
            lightColor={chart.lightColor}
            darkColor={chart.darkColor}
          />
        ))}
      </div>
    </section>
  );
}
