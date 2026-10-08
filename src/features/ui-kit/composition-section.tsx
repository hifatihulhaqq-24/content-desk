"use client";

import { BarChart } from "@/components/data/bar-chart";
import { ChartCard } from "@/components/data/chart-card";
import { DonutChart } from "@/components/data/donut-chart";
import { Heatmap } from "@/components/data/heatmap";
import { KitSection } from "./kit-section";
import {
  DEMO_DONUT,
  DEMO_HEATMAP_CELLS,
  DEMO_PLATFORM_BAR_COLORS,
  DEMO_PLATFORM_BARS,
  DEMO_STACKED_ROWS,
} from "./demo-data";

const PLATFORM_ROWS = DEMO_PLATFORM_BARS.map((item) => ({
  name: item.label,
  value: item.value,
}));

export function CompositionSection() {
  return (
    <KitSection
      id="bar-donut"
      title="BarChart, DonutChart & Heatmap"
      description="Perbandingan antar kategori, komposisi dari total, dan pola waktu. Sumbu nilai selalu mulai dari 0; donut maksimal 5 segmen."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Bar horizontal — Kontribusi per platform"
          description="Satu seri dengan warna brand per kategori"
          height={280}
        >
          <BarChart
            data={PLATFORM_ROWS}
            xKey="name"
            bars={[{ key: "value", label: "Impressions" }]}
            orientation="horizontal"
            barColors={DEMO_PLATFORM_BAR_COLORS}
            height={280}
            showLegend={false}
          />
        </ChartCard>

        <ChartCard
          title="Bar stacked — Impressions per tipe konten"
          description="Beberapa seri bertumpuk per platform"
          height={280}
        >
          <BarChart
            data={DEMO_STACKED_ROWS}
            xKey="name"
            bars={[
              { key: "Reels", label: "Reels", stackId: "a" },
              { key: "Carousel", label: "Carousel", stackId: "a" },
              { key: "Image", label: "Image", stackId: "a" },
            ]}
            height={280}
          />
        </ChartCard>

        <ChartCard
          title="Donut — Komposisi followers"
          description="Label tengah total + legend persentase"
          height={240}
        >
          <DonutChart
            data={DEMO_DONUT}
            centerLabel="Total followers"
            height={240}
          />
        </ChartCard>

        <ChartCard
          title="Heatmap — Hari × jam"
          description="Skala satu warna; intensitas = engagement"
          height={240}
        >
          <Heatmap cells={DEMO_HEATMAP_CELLS} valueLabel="Engagement" />
        </ChartCard>
      </div>
    </KitSection>
  );
}
