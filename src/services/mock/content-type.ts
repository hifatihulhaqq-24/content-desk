import type {
  ContentFormat,
  ContentTypeData,
  ContentTypePoint,
  ContentTypeQuery,
} from "@/types/analytics";
import { CONTENT_FORMATS } from "@/config/content-elements";
import { toIsoDate } from "@/lib/date";
import { rangesFromQuery } from "./aggregate";
import { engagementOf, filterByCluster } from "./post-aggregate";
import { postsInRange } from "./posts";
import { resolveScopeAccountIds, scopeKey } from "./scope";

const cache = new Map<string, ContentTypeData>();

function emptyPoint(format: ContentFormat): ContentTypePoint {
  return { format, content: 0, impressions: 0, engagements: 0 };
}

export function zeroContentType(): ContentTypeData {
  return {
    formats: CONTENT_FORMATS.map(emptyPoint),
    totals: { content: 0, impressions: 0, engagements: 0 },
  };
}

/** Agregasi Content Type Analysis (Single Image/Video/Carousel) dari daftar konten. */
export function computeContentType(query: ContentTypeQuery): ContentTypeData {
  const key = scopeKey(query);
  const cached = cache.get(key);
  if (cached) return cached;

  const { current } = rangesFromQuery(query);
  const accountIds = resolveScopeAccountIds(query);
  const posts = filterByCluster(
    postsInRange(accountIds, toIsoDate(current.from), toIsoDate(current.to)),
    query.cluster
  );

  const data = zeroContentType();
  const byFormat = new Map(
    data.formats.map((point) => [point.format, point] as const)
  );

  for (const post of posts) {
    const point = byFormat.get(post.format);
    if (!point) continue;
    point.content += 1;
    point.impressions += post.metrics.impressions;
    point.engagements += engagementOf(post);
    data.totals.content += 1;
    data.totals.impressions += post.metrics.impressions;
    data.totals.engagements += engagementOf(post);
  }

  cache.set(key, data);
  return data;
}
