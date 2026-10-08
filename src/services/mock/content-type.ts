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
  return { format, content: 0, views: 0, engagements: 0, newFollowers: 0 };
}

export function zeroContentType(): ContentTypeData {
  return {
    formats: CONTENT_FORMATS.map(emptyPoint),
    totals: { content: 0, views: 0, engagements: 0, newFollowers: 0 },
  };
}

/** Agregasi Content Type Analysis (Gambar/Video/Carousel) dari daftar konten. */
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
    point.views += post.metrics.views;
    point.engagements += engagementOf(post);
    point.newFollowers += post.metrics.newFollowers;
    data.totals.content += 1;
    data.totals.views += post.metrics.views;
    data.totals.engagements += engagementOf(post);
    data.totals.newFollowers += post.metrics.newFollowers;
  }

  cache.set(key, data);
  return data;
}
