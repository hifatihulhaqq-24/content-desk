import {
  clamp,
  gauss,
  isoToDayIndex,
  isoWeekday,
  randRange,
} from "./random";

export interface DailyRecord {
  date: string;
  reach: number;
  impressions: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  profileVisits: number;
  views: number;
  watchTime: number;
  avgViewDuration: number;
  followers: number;
}

interface AccountProfile {
  baseFollowers: number;
  reachBase: number;
  growthAnnual: number;
  erBase: number;
  avgDurationBase: number;
  viewScale: [number, number];
}

const WEEKDAY_FACTOR = [0.72, 1.04, 1.08, 1.06, 1.02, 0.93, 0.74];
const ANCHOR_DAY = isoToDayIndex("2026-01-01");

const profileCache = new Map<string, AccountProfile>();
const seriesCache = new Map<string, DailyRecord>();

function platformPrefix(accountId: string): string {
  return accountId.split("-acc-")[0];
}

function profileOf(accountId: string): AccountProfile {
  const cached = profileCache.get(accountId);
  if (cached) return cached;
  const baseFollowers = Math.round(randRange(12_000, 420_000, accountId, "bf"));
  const prefix = platformPrefix(accountId);
  const isVideo = prefix === "tt" || prefix === "yt";
  const profile: AccountProfile = {
    baseFollowers,
    reachBase: Math.round(baseFollowers * randRange(0.22, 0.62, accountId, "rb")),
    growthAnnual: randRange(0.04, 0.55, accountId, "g"),
    erBase: randRange(0.02, 0.075, accountId, "e"),
    avgDurationBase:
      prefix === "yt"
        ? randRange(280, 720, accountId, "d")
        : prefix === "tt"
          ? randRange(9, 26, accountId, "d")
          : randRange(5, 18, accountId, "d"),
    viewScale: isVideo ? [2.1, 4.6] : [1.1, 1.7],
  };
  profileCache.set(accountId, profile);
  return profile;
}

export function dailyAt(accountId: string, iso: string): DailyRecord {
  const key = `${accountId}|${iso}`;
  const cached = seriesCache.get(key);
  if (cached) return cached;

  const p = profileOf(accountId);
  const dayIndex = isoToDayIndex(iso);
  const years = (dayIndex - ANCHOR_DAY) / 365;
  const trend = Math.pow(1 + p.growthAnnual, years);
  const weekday = WEEKDAY_FACTOR[isoWeekday(iso)];
  const seasonal = 1 + 0.07 * Math.sin((2 * Math.PI * (dayIndex % 365)) / 365);
  const reachNoise = 1 + gauss(accountId, iso, "r") * 0.15;

  const reach = Math.max(
    1,
    Math.round(p.reachBase * trend * weekday * seasonal * reachNoise)
  );
  const impressions = Math.round(
    reach * randRange(1.3, 2.2, accountId, iso, "im")
  );
  const er = p.erBase * randRange(0.72, 1.35, accountId, iso, "er");
  const engagement = Math.max(1, Math.round(reach * er));
  const likes = Math.round(engagement * randRange(0.6, 0.75, accountId, iso, "l"));
  const comments = Math.round(
    engagement * randRange(0.06, 0.11, accountId, iso, "c")
  );
  const shares = Math.round(
    engagement * randRange(0.07, 0.13, accountId, iso, "s")
  );
  const saves = Math.max(0, engagement - likes - comments - shares);
  const clicks = Math.round(reach * randRange(0.01, 0.05, accountId, iso, "k"));
  const profileVisits = Math.round(
    reach * randRange(0.03, 0.12, accountId, iso, "pv")
  );
  const views = Math.round(
    reach * randRange(p.viewScale[0], p.viewScale[1], accountId, iso, "v")
  );
  const avgViewDuration = Math.round(
    p.avgDurationBase * randRange(0.85, 1.2, accountId, iso, "ad")
  );
  const watchTime = (views * avgViewDuration) / 3600;
  const followers = Math.max(
    100,
    Math.round(
      p.baseFollowers * trend * (1 + gauss(accountId, iso, "f") * 0.004)
    )
  );

  const record: DailyRecord = {
    date: iso,
    reach,
    impressions,
    engagement,
    likes,
    comments,
    shares,
    saves,
    clicks,
    profileVisits,
    views,
    watchTime: clamp(watchTime, 0, Number.MAX_SAFE_INTEGER),
    avgViewDuration,
    followers,
  };
  seriesCache.set(key, record);
  return record;
}

export function followersAt(accountId: string, iso: string): number {
  return dailyAt(accountId, iso).followers;
}
