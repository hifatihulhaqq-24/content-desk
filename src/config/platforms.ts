export type PlatformId =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "facebook"
  | "x";

export interface AccountConfig {
  id: string;
  name: string;
  handle: string;
}

export interface PlatformKpiConfig {
  key: string;
  label?: string;
}

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  color: string;
  kpis: PlatformKpiConfig[];
  trendMetrics: string[];
  contentTypes: string[];
  accounts: AccountConfig[];
  /** Sembunyikan platform sementara dari seluruh tampilan (belum dihapus dari kontrak). */
  hidden?: boolean;
}

/** Brand akun kumparan — berlaku untuk seluruh platform. */
const KUMPARAN_BRANDS: {
  name: string;
  atHandle: string;
  displayHandle: string;
}[] = [
  { name: "kumparan", atHandle: "@kumparan", displayHandle: "kumparan" },
  {
    name: "kumparanBISNIS",
    atHandle: "@kumparanbisnis",
    displayHandle: "kumparanBISNIS",
  },
  {
    name: "kumparanMOM",
    atHandle: "@kumparanmom",
    displayHandle: "kumparanMOM",
  },
  {
    name: "kumparanWOMAN",
    atHandle: "@kumparanwoman",
    displayHandle: "kumparanWOMAN",
  },
  {
    name: "kumparanOTO",
    atHandle: "@kumparanoto",
    displayHandle: "kumparanOTO",
  },
];

/** Akun kumparan per platform; `useAtHandle` untuk platform bergaya @handle. */
function kumparanAccounts(
  prefix: string,
  useAtHandle: boolean
): AccountConfig[] {
  return KUMPARAN_BRANDS.map((brand, index) => ({
    id: `${prefix}-acc-${index + 1}`,
    name: brand.name,
    handle: useAtHandle ? brand.atHandle : brand.displayHandle,
  }));
}

export const PLATFORMS: PlatformConfig[] = [
  {
    id: "instagram",
    name: "Instagram",
    color: "#e1306c",
    kpis: [
      { key: "followers" },
      { key: "reach" },
      { key: "impressions" },
      { key: "engagementRate" },
    ],
    trendMetrics: [
      "reach",
      "impressions",
      "engagement",
      "engagementRate",
      "likes",
      "comments",
      "shares",
      "saves",
      "profileVisits",
    ],
    contentTypes: ["Reels", "Carousel", "Image", "Story"],
    accounts: kumparanAccounts("ig", true),
  },
  {
    id: "tiktok",
    name: "TikTok",
    color: "#0f0f0f",
    kpis: [
      { key: "followers" },
      { key: "views", label: "Video Views" },
      { key: "engagementRate" },
      { key: "profileVisits", label: "Profile Views" },
    ],
    trendMetrics: [
      "views",
      "engagement",
      "engagementRate",
      "likes",
      "comments",
      "shares",
      "followersGrowth",
    ],
    contentTypes: ["Video Pendek", "Foto", "Carousel", "LIVE"],
    accounts: kumparanAccounts("tt", true),
  },
  {
    id: "youtube",
    name: "YouTube",
    color: "#ff0000",
    kpis: [
      { key: "followers", label: "Subscribers" },
      { key: "views" },
      { key: "watchTime" },
      { key: "avgViewDuration" },
    ],
    trendMetrics: [
      "views",
      "watchTime",
      "impressions",
      "impressionsCtr",
      "likes",
      "comments",
      "followersGrowth",
    ],
    contentTypes: ["Video", "Short", "Live"],
    accounts: kumparanAccounts("yt", false),
  },
  {
    id: "facebook",
    name: "Facebook",
    color: "#1877f2",
    kpis: [
      { key: "followers", label: "Page Followers" },
      { key: "reach" },
      { key: "engagement", label: "Post Engagement" },
      { key: "profileVisits", label: "Page Views" },
    ],
    trendMetrics: [
      "reach",
      "impressions",
      "engagement",
      "likes",
      "comments",
      "shares",
      "clicks",
    ],
    contentTypes: ["Image", "Carousel", "Video", "Link", "Reel"],
    accounts: kumparanAccounts("fb", false),
  },
  {
    id: "x",
    name: "X",
    color: "#000000",
    hidden: true,
    kpis: [
      { key: "followers" },
      { key: "impressions" },
      { key: "engagement", label: "Engagements" },
      { key: "engagementRate" },
    ],
    trendMetrics: [
      "impressions",
      "engagement",
      "engagementRate",
      "likes",
      "comments",
      "shares",
      "clicks",
      "profileVisits",
    ],
    contentTypes: ["Post", "Media", "Carousel", "Poll"],
    accounts: kumparanAccounts("x", true),
  },
];

export const PLATFORM_MAP = Object.fromEntries(
  PLATFORMS.map((p) => [p.id, p])
) as Record<PlatformId, PlatformConfig>;

/** Platform yang tampil di UI (menyembunyikan yang ditandai `hidden`). */
export const VISIBLE_PLATFORMS = PLATFORMS.filter((p) => !p.hidden);

export function isVisiblePlatform(id: PlatformId): boolean {
  return !PLATFORM_MAP[id].hidden;
}

export function isPlatformId(value: string): value is PlatformId {
  return value in PLATFORM_MAP;
}

export function findAccount(
  accountId: string
): { platform: PlatformConfig; account: AccountConfig } | null {
  for (const platform of PLATFORMS) {
    const account = platform.accounts.find((a) => a.id === accountId);
    if (account) return { platform, account };
  }
  return null;
}
