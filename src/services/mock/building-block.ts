import type {
  BuildingBlockData,
  BuildingBlockPoint,
  BuildingBlockQuery,
} from "@/types/analytics";
import { BUILDING_BLOCKS } from "@/config/content-elements";
import { toIsoDate } from "@/lib/date";
import { rangesFromQuery } from "./aggregate";
import { engagementOf, filterByCluster } from "./post-aggregate";
import { postsInRange } from "./posts";
import { resolveScopeAccountIds, scopeKey } from "./scope";

const cache = new Map<string, BuildingBlockData>();

function emptyPoint(
  block: BuildingBlockPoint["block"]
): BuildingBlockPoint {
  return {
    block,
    content: 0,
    views: 0,
    viewsPerContent: 0,
    engagements: 0,
    engagementsPerContent: 0,
  };
}

export function zeroBuildingBlock(): BuildingBlockData {
  return { blocks: BUILDING_BLOCKS.map(emptyPoint) };
}

/** Agregasi Building Block Analysis (Top 5) dari daftar konten. */
export function computeBuildingBlock(
  query: BuildingBlockQuery
): BuildingBlockData {
  const key = scopeKey(query);
  const cached = cache.get(key);
  if (cached) return cached;

  const { current } = rangesFromQuery(query);
  const accountIds = resolveScopeAccountIds(query);
  const posts = filterByCluster(
    postsInRange(accountIds, toIsoDate(current.from), toIsoDate(current.to)),
    query.cluster
  );

  const blocks = BUILDING_BLOCKS.map(emptyPoint);
  const byBlock = new Map(
    blocks.map((point) => [point.block, point] as const)
  );

  for (const post of posts) {
    const point = byBlock.get(post.buildingBlock);
    if (!point) continue;
    point.content += 1;
    point.views += post.metrics.views;
    point.engagements += engagementOf(post);
  }

  for (const point of blocks) {
    point.viewsPerContent =
      point.content > 0 ? Math.round(point.views / point.content) : 0;
    point.engagementsPerContent =
      point.content > 0 ? Math.round(point.engagements / point.content) : 0;
  }

  const data = { blocks };
  cache.set(key, data);
  return data;
}
