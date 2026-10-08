import type { PlatformId } from "@/config/platforms";
import { findAccount, PLATFORM_MAP } from "@/config/platforms";
import { PageContainer, PageHeader } from "@/components/layout/page-container";

export function AccountView({
  platform,
  accountId,
}: {
  platform: PlatformId;
  accountId: string;
}) {
  const found = findAccount(accountId);
  return (
    <PageContainer>
      <PageHeader
        title={found?.account.name ?? "Akun"}
        description={`Performa akun ${PLATFORM_MAP[platform].name} ${found?.account.handle ?? ""}.`}
      />
    </PageContainer>
  );
}
