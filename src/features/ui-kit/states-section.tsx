"use client";

import { DateRangePicker } from "@/components/data/date-range-picker";
import { ChartCard } from "@/components/data/chart-card";
import { EmptyState, ErrorState } from "@/components/data/states";
import { Button } from "@/components/ui/button";
import { KitSection } from "./kit-section";
import { TrendChart } from "@/components/data/trend-chart";
import { DEMO_TREND } from "./demo-data";

export function StatesSection() {
  return (
    <KitSection
      id="states"
      title="State & Filter"
      description="Setiap komponen data wajib punya 4 state: idle, loading, success, error (UI States Guarantee). Filter tanggal (chip statis 7 hari terakhir) tersedia di TopBar untuk seluruh halaman analytics."
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <DateRangePicker />
        <span className="text-xs text-muted-foreground">
          DateRangePicker (chip statis — 7 hari / 1 minggu terakhir)
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ChartCard title="Success" description="Data tersedia" height={180}>
          <TrendChart
            points={DEMO_TREND.slice(0, 14)}
            series={[{ key: "reach", label: "Reach" }]}
            height={180}
          />
        </ChartCard>

        <ChartCard
          title="Loading"
          description="Skeleton mengikuti tinggi chart"
          status="pending"
          height={180}
        />

        <ChartCard
          title="Empty"
          description="Periode tanpa data"
          isEmpty
          height={180}
          emptyMessage="Belum ada interaksi pada periode ini."
        />

        <ChartCard
          title="Error"
          description="Gagal memuat + aksi pemulihan"
          status="error"
          onRetry={() => undefined}
          height={180}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <p className="mb-3 text-sm font-medium">EmptyState (mandiri)</p>
          <div className="h-44">
            <EmptyState
              title="Belum ada konten"
              message="Unggah konten pertama Anda untuk mulai melihat performa."
              action={<Button size="sm">Buat konten</Button>}
            />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="mb-3 text-sm font-medium">ErrorState (mandiri)</p>
          <div className="h-44">
            <ErrorState onRetry={() => undefined} />
          </div>
        </div>
      </div>
    </KitSection>
  );
}
