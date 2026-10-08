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
    impressions: 0,
    engagements: 0,
    engagementRate: null,
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
  const reachByBlock = new Map<BuildingBlockPoint["block"], number>(
    BUILDING_BLOCKS.map((block) => [block, 0])
  );

  for (const post of posts) {
    const point = byBlock.get(post.buildingBlock);
    if (!point) continue;
    point.content += 1;
    point.impressions += post.metrics.impressions;
    point.engagements += engagementOf(post);
    reachByBlock.set(
      post.buildingBlock,
      (reachByBlock.get(post.buildingBlock) ?? 0) + post.metrics.reach
    );
  }

  for (const point of blocks) {
    const reach = reachByBlock.get(point.block) ?? 0;
    point.engagementRate =
      reach > 0
        ? Math.round((point.engagements / reach) * 1000) / 10
        : null;
  }

  const data = { blocks };
  cache.set(key, data);
  return data;
}
