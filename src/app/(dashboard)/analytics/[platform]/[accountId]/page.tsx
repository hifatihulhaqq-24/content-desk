import { notFound } from "next/navigation";
import {
  findAccount,
  isPlatformId,
  isVisiblePlatform,
  VISIBLE_PLATFORMS,
} from "@/config/platforms";
import { AccountView } from "@/features/account/account-view";

export function generateStaticParams() {
  return VISIBLE_PLATFORMS.flatMap((platform) =>
    platform.accounts.map((account) => ({
      platform: platform.id,
      accountId: account.id,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ platform: string; accountId: string }>;
}) {
  const { accountId } = await params;
  const found = findAccount(accountId);
  return { title: found?.account.name ?? "Akun" };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ platform: string; accountId: string }>;
}) {
  const { platform, accountId } = await params;
  const found = findAccount(accountId);
  if (
    !isPlatformId(platform) ||
    !isVisiblePlatform(platform) ||
    !found ||
    found.platform.id !== platform
  ) {
    notFound();
  }
  return <AccountView platform={platform} accountId={accountId} />;
}
