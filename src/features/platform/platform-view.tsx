import type { PlatformId } from "@/config/platforms";
import { PLATFORM_MAP } from "@/config/platforms";
import { PageContainer, PageHeader } from "@/components/layout/page-container";

export function PlatformView({ platform }: { platform: PlatformId }) {
  const config = PLATFORM_MAP[platform];
  return (
    <PageContainer>
      <PageHeader
        title={config.name}
        description={`Performa detail ${config.name}.`}
      />
    </PageContainer>
  );
}
