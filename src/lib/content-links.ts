import { findAccount } from "@/config/platforms";
import type { ArticleSummary, Post } from "@/types/analytics";

/** Atribut wajib untuk link eksternal — buka di tab baru. */
export const EXTERNAL_LINK_PROPS = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

function handleForAccount(accountId: string): string {
  const found = findAccount(accountId);
  if (!found) return "kumparan";
  return found.account.handle.replace(/^@/, "");
}

export function postUrl(post: Post): string {
  const handle = handleForAccount(post.accountId);
  switch (post.platform) {
    case "instagram":
      return `https://www.instagram.com/${handle}/p/${post.id}/`;
    case "tiktok":
      return `https://www.tiktok.com/@${handle}/video/${post.id}`;
    case "facebook":
      return `https://www.facebook.com/${handle}/posts/${post.id}`;
    case "youtube":
      return `https://www.youtube.com/watch?v=${post.id}`;
    case "x":
      return `https://x.com/${handle}/status/${post.id}`;
  }
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "artikel";
}

export function articleUrl(article: ArticleSummary): string {
  return `https://kumparan.com/${slugify(article.title)}-${article.id}`;
}