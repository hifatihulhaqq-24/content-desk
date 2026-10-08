import type {
  AudienceBreakdown,
  AccountSummary,
} from "@/types/analytics";
import { findAccount } from "@/config/platforms";
import { aggregateRange, type RangeAggregate } from "./aggregate";
import { rand01, randRange } from "./random";

export function toAccountSummary(
  accountId: string,
  aggregate: RangeAggregate
): AccountSummary | null {
  const found = findAccount(accountId);
  if (!found) return null;
  const { platform, account } = found;
  const growth =
    aggregate.followersStart > 0
      ? ((aggregate.followersEnd - aggregate.followersStart) /
          aggregate.followersStart) *
        100
      : null;
  const engagementRate =
    aggregate.totals.reach > 0
      ? (aggregate.totals.engagement / aggregate.totals.reach) * 100
      : null;
  const syncHour = 7 + Math.floor(rand01(accountId, "sync-h") * 5);
  const syncMinute = Math.floor(rand01(accountId, "sync-m") * 60);
  const synced = new Date();
  synced.setHours(syncHour, syncMinute, 0, 0);

  return {
    id: account.id,
    platform: platform.id,
    name: account.name,
    handle: account.handle,
    status: "connected",
    lastSyncedAt: synced.toISOString(),
    followers: aggregate.followersEnd,
    followersGrowthPercent:
      growth !== null ? Math.round(growth * 10) / 10 : null,
    engagementRate:
      engagementRate !== null ? Math.round(engagementRate * 10) / 10 : null,
    posts: aggregate.postsCount,
  };
}

export function computeAudience(accountId: string): AudienceBreakdown {
  const male = Math.round(randRange(38, 68, accountId, "male"));
  const ages = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"];
  const rawAges = ages.map((label, i) => ({
    label,
    value: Math.round(randRange(4, 42, accountId, "age", i)),
  }));
  const ageTotal = rawAges.reduce((sum, a) => sum + a.value, 0);
  const locations = [
    "Jakarta",
    "Surabaya",
    "Bandung",
    "Medan",
    "Yogyakarta",
    "Lainnya",
  ];
  const rawLocations = locations.map((label, i) => ({
    label,
    value: Math.round(randRange(3, 46, accountId, "loc", i)),
  }));
  const locTotal = rawLocations.reduce((sum, l) => sum + l.value, 0);

  return {
    genders: [
      { label: "Laki-laki", value: male },
      { label: "Perempuan", value: 100 - male },
    ],
    ageRanges: rawAges.map((a) => ({
      label: a.label,
      value: Math.round((a.value / ageTotal) * 1000) / 10,
    })),
    locations: rawLocations.map((l) => ({
      label: l.label,
      value: Math.round((l.value / locTotal) * 1000) / 10,
    })),
  };
}

export function summarizeAccounts(
  accountIds: string[],
  range: { from: Date; to: Date }
): AccountSummary[] {
  const summaries: AccountSummary[] = [];
  for (const id of accountIds) {
    const aggregate = aggregateRange([id], range);
    const summary = toAccountSummary(id, aggregate);
    if (summary) summaries.push(summary);
  }
  return summaries;
}
