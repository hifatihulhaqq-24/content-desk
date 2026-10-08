export const CLUSTERS = [
  "News",
  "Bisnis",
  "Bola & Sport",
  "Bolanita",
  "Entertainment",
  "Mom",
  "Woman",
  "Otomotif",
] as const;

export type ClusterId = (typeof CLUSTERS)[number];

export const ALL_CLUSTERS = "all";

export type ClusterFilter = ClusterId | typeof ALL_CLUSTERS;

export function isClusterFilter(value: string): value is ClusterFilter {
  return value === ALL_CLUSTERS || (CLUSTERS as readonly string[]).includes(value);
}
