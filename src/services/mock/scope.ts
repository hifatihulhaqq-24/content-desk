import type { ScopeQuery } from "@/types/analytics";
import {
  findAccount,
  PLATFORM_MAP,
  VISIBLE_PLATFORMS,
} from "@/config/platforms";

/** Resolusi cakupan query → daftar accountId (akun hidden/platform hidden dikecualikan). */
export function resolveScopeAccountIds(query: ScopeQuery): string[] {
  const accountId = query.accountId ?? "all";
  if (accountId !== "all") {
    const found = findAccount(accountId);
    if (!found || found.platform.hidden) return [];
    if (
      query.platform &&
      query.platform !== "all" &&
      found.platform.id !== query.platform
    ) {
      return [];
    }
    return [accountId];
  }

  const platform = query.platform ?? "all";
  if (platform === "all") {
    return VISIBLE_PLATFORMS.flatMap((item) =>
      item.accounts.map((account) => account.id)
    );
  }
  const config = PLATFORM_MAP[platform];
  return config && !config.hidden
    ? config.accounts.map((account) => account.id)
    : [];
}

/** Key cache stabil untuk query berbasis cakupan. */
export function scopeKey(query: ScopeQuery): string {
  return [
    query.from,
    query.to,
    query.cluster ?? "all",
    query.platform ?? "all",
    query.accountId ?? "all",
  ].join("|");
}
