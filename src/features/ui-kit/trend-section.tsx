"use client";

import { ChartCard } from "@/components/data/chart-card";
import { TrendChart } from "@/components/data/trend-chart";
import { KitSection } from "./kit-section";
import { DEMO_TREND, DEMO_TREND_PREVIOUS } from "./demo-data";

export function TrendSection() {
  return (
    <KitSection
      id="trend-chart"
      title="TrendChart (Line / Area)"
      description="Tren harian maksimal 3–4 seri, dengan tooltip ringkas, legend, dan perbandingan periode sebelumnya."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Area — Reach + perbandingan"
          description="Satu seri utama dengan overlay periode sebelumnya (garis putus-putus)"
          height={300}
        >
          <TrendChart
            points={DEMO_TREND}
            series={[{ key: "reach", label: "Reach" }]}
            type="area"
            previousPoints={DEMO_TREND_PREVIOUS}
            previousLabel="Periode sebelumnya"
            height={300}
          />
        </ChartCard>

        <ChartCard
          title="Line — Multi seri"
          description="Reach, impressions, dan engagement dalam satu grafik"
          height={300}
        >
          <TrendChart
            points={DEMO_TREND}
            series={[
              { key: "reach", label: "Reach" },
              { key: "impressions", label: "Impressions" },
              { key: "engagement", label: "Engagement" },
            ]}
            type="line"
            height={300}
          />
        </ChartCard>
      </div>
    </KitSection>
  );
}
