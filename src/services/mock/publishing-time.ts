import type {
  PublishingHourPoint,
  PublishingTimeData,
  PublishingTimeQuery,
  Post,
} from "@/types/analytics";
import { findAccount } from "@/config/platforms";
import { toIsoDate } from "@/lib/date";
import { rangesFromQuery } from "./aggregate";
import { aggregatePosts, filterByCluster } from "./post-aggregate";
import { accountHourWeights, hourPerformance } from "./hour-weights";
import { postsInRange } from "./posts";
import { rand01 } from "./random";
import { resolveScopeAccountIds, scopeKey } from "./scope";

/** Window Publishing Time: konten jam 07.00–21.00 saja yang dihitung. */
const HOUR_START = 7;
const HOUR_END = 21;
const HOUR_COUNT = HOUR_END - HOUR_START + 1;

const cache = new Map<string, PublishingTimeData>();

export function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}.00`;
}

function isWithinWindow(post: Post): boolean {
  const hour = Number(post.publishedAt.slice(11, 13));
  return hour >= HOUR_START && hour <= HOUR_END;
}

export function zeroHourPoints(): PublishingHourPoint[] {
  return Array.from({ length: HOUR_COUNT }, (_, index) => {
    const hour = HOUR_START + index;
    return {
      hour,
      label: hourLabel(hour),
      content: 0,
      views: 0,
      engagements: 0,
    };
  });
}

/** Bobot jam window 07–21 seluruh akun cakupan, rata-rata berbobot tayangan. */
function scopeHourWeights(accountIds: string[], posts: Post[]): number[] {
  const totals = new Array(HOUR_COUNT).fill(0);
  let weightSum = 0;

  for (const accountId of accountIds) {
    const found = findAccount(accountId);
    if (!found) continue;
    const accountViews = posts.reduce(
      (sum, post) =>
        post.accountId === accountId ? sum + post.metrics.views : sum,
      0
    );
    const weight = accountViews > 0 ? accountViews : 1;
    const weights = accountHourWeights(accountId, found.platform.id);
    for (let index = 0; index < HOUR_COUNT; index += 1) {
      totals[index] += weights[HOUR_START + index] * weight;
    }
    weightSum += weight;
  }

  if (weightSum <= 0) return new Array(HOUR_COUNT).fill(1 / HOUR_COUNT);
  return totals.map((value) => value / weightSum);
}

function normalize(values: number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 1 / values.length);
  return values.map((value) => value / total);
}

/**
 * Bagi `total` ke 15 jam (07.00–21.00) sesuai bobot (largest remainder)
 * dengan minimal `min` per jam — memastikan tidak ada jam bernilai 0.
 */
function allocate(total: number, weights: number[], min: number): number[] {
  const result = new Array(HOUR_COUNT).fill(0);
  if (total <= 0 || weights.length !== HOUR_COUNT) return result;

  const raw = weights.map((weight) => weight * total);
  for (let index = 0; index < HOUR_COUNT; index += 1) {
    result[index] = Math.floor(raw[index]);
  }

  let remainder = total - result.reduce((sum, value) => sum + value, 0);
  const byFraction = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  let cursor = 0;
  while (remainder > 0) {
    result[byFraction[cursor % HOUR_COUNT].index] += 1;
    remainder -= 1;
    cursor += 1;
  }

  let deficit = 0;
  for (let index = 0; index < HOUR_COUNT; index += 1) {
    if (result[index] < min) {
      deficit += min - result[index];
      result[index] = min;
    }
  }
  if (deficit > 0) {
    const bySize = result
      .map((value, index) => ({ value, index }))
      .sort((a, b) => b.value - a.value);
    let cursor2 = 0;
    while (deficit > 0 && cursor2 < HOUR_COUNT) {
      const { index } = bySize[cursor2];
      const spare = result[index] - min;
      if (spare > 0) {
        const take = Math.min(spare, deficit);
        result[index] -= take;
        deficit -= take;
      }
      cursor2 += 1;
    }
  }

  return result;
}

export function computePublishingTime(
  query: PublishingTimeQuery
): PublishingTimeData {
  const key = scopeKey(query);
  const cached = cache.get(key);
  if (cached) return cached;

  const { current } = rangesFromQuery(query);
  const accountIds = resolveScopeAccountIds(query);
  const posts = filterByCluster(
    postsInRange(accountIds, toIsoDate(current.from), toIsoDate(current.to)),
    query.cluster
  ).filter(isWithinWindow);

  const totals = { content: 0, views: 0, engagements: 0 };
  let data: PublishingTimeData;

  if (posts.length === 0) {
    data = { points: zeroHourPoints(), totals };
  } else {
    const aggregate = aggregatePosts(posts, current);
    totals.content = aggregate.postsCount;
    totals.views = Math.round(aggregate.totals.views);
    totals.engagements = Math.round(aggregate.totals.engagement);

    const contentWeights = scopeHourWeights(accountIds, posts);
    const viewWeights = normalize(
      contentWeights.map((weight, index) =>
        weight * hourPerformance(HOUR_START + index)
      )
    );
    const engagementWeights = normalize(
      viewWeights.map((weight, index) => {
        const hour = HOUR_START + index;
        return weight * (0.9 + rand01("engagement", hour, key) * 0.2);
      })
    );

    const content = allocate(totals.content, contentWeights, 1);
    const views = allocate(totals.views, viewWeights, 1);
    const engagements = allocate(totals.engagements, engagementWeights, 1);

    data = {
      points: Array.from({ length: HOUR_COUNT }, (_, index) => {
        const hour = HOUR_START + index;
        return {
          hour,
          label: hourLabel(hour),
          content: content[index],
          views: views[index],
          engagements: engagements[index],
        };
      }),
      totals,
    };
  }

  cache.set(key, data);
  return data;
}
