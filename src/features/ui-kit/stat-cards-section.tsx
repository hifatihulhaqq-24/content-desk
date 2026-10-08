"use client";

import { DeltaBadge } from "@/components/data/delta-badge";
import { PlatformBadge } from "@/components/data/platform-badge";
import { StatCard } from "@/components/data/stat-card";
import { KitRow, KitSection } from "./kit-section";
import { DEMO_SPARKLINE } from "./demo-data";

export function StatCardsSection() {
  return (
    <KitSection
      id="stat-card"
      title="StatCard, DeltaBadge & PlatformBadge"
      description="Kartu KPI dengan delta vs periode sebelumnya dan sparkline opsional. Delta selalu punya ikon panah — bukan hanya warna."
    >
      <KitRow>
        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard
            label="Total Followers"
            value={245_800}
            deltaPercent={4.2}
            sparkline={DEMO_SPARKLINE}
          />
          <StatCard
            label="Reach"
            value={1_240_000}
            deltaPercent={-8.1}
            sparkline={DEMO_SPARKLINE.slice().reverse()}
          />
          <StatCard
            label="Engagement Rate"
            value={5.4}
            format="percent"
            deltaPercent={0}
            hint="Engagement dibagi reach"
          />
          <StatCard label="Total Post" value={184} deltaPercent={null} />
        </div>
        <div className="grid gap-3">
          <StatCard label="Loading state" value={0} loading />
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm font-medium">DeltaBadge</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <DeltaBadge value={12.4} /> <span className="text-xs text-muted-foreground">naik</span>
              </span>
              <span className="flex items-center gap-2">
                <DeltaBadge value={-3.2} /> <span className="text-xs text-muted-foreground">turun</span>
              </span>
              <span className="flex items-center gap-2">
                <DeltaBadge value={0} /> <span className="text-xs text-muted-foreground">tetap</span>
              </span>
              <span className="flex items-center gap-2">
                <DeltaBadge value={null} /> <span className="text-xs text-muted-foreground">tanpa data</span>
              </span>
            </div>
            <p className="mt-5 text-sm font-medium">PlatformBadge</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <PlatformBadge platform="instagram" />
              <PlatformBadge platform="tiktok" />
              <PlatformBadge platform="youtube" />
              <PlatformBadge platform="facebook" />
            </div>
          </div>
        </div>
      </KitRow>
    </KitSection>
  );
}
