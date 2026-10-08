import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { CompositionSection } from "./composition-section";
import { StatesSection } from "./states-section";
import { StatCardsSection } from "./stat-cards-section";
import { TableSection } from "./table-section";
import { TrendSection } from "./trend-section";

export function UiKitView() {
  return (
    <PageContainer>
      <PageHeader
        title="UI Kit Data Visualization"
        description="Referensi hidup: setiap komponen dengan variasi state-nya. Halaman analytics dibangun hanya dari komponen di sini."
      />
      <div className="space-y-10">
        <StatCardsSection />
        <TrendSection />
        <CompositionSection />
        <StatesSection />
        <TableSection />
      </div>
    </PageContainer>
  );
}
