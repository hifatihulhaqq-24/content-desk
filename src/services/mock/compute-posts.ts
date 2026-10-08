import type { Paged, Post, PostFilter } from "@/types/analytics";
import { postsInRange } from "./posts";

type SortKey = "publishedAt" | "reach" | "engagementRate" | "likes";

function compare(a: Post, b: Post, key: SortKey): number {
  if (key === "publishedAt") return a.publishedAt.localeCompare(b.publishedAt);
  if (key === "reach") return a.metrics.reach - b.metrics.reach;
  if (key === "engagementRate")
    return a.metrics.engagementRate - b.metrics.engagementRate;
  return a.metrics.likes - b.metrics.likes;
}

export function computeAccountPosts(filter: PostFilter): Paged<Post> {
  let posts = postsInRange([filter.accountId], filter.from, filter.to);

  if (filter.type && filter.type !== "all") {
    posts = posts.filter((post) => post.type === filter.type);
  }
  if (filter.search?.trim()) {
    const query = filter.search.trim().toLowerCase();
    posts = posts.filter(
      (post) =>
        post.caption.toLowerCase().includes(query) ||
        post.type.toLowerCase().includes(query)
    );
  }

  const sortKey: SortKey = (filter.sortKey as SortKey) ?? "publishedAt";
  const direction = filter.sortDir === "asc" ? 1 : -1;
  posts = [...posts].sort((a, b) => direction * compare(a, b, sortKey));

  const total = posts.length;
  const pageSize = filter.pageSize;
  const start = (filter.page - 1) * pageSize;

  return {
    items: posts.slice(start, start + pageSize),
    total,
    page: filter.page,
    pageSize,
  };
}
