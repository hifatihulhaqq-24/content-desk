/**
 * Toggle state untuk demo (?state=loading|empty|error).
 * Hanya dibaca di client (queryFn) sehingga aman untuk prerender.
 */
export type DemoState = "normal" | "loading" | "empty" | "error";

export function getDemoState(): DemoState {
  if (typeof window === "undefined") return "normal";
  const raw = new URLSearchParams(window.location.search).get("state");
  if (raw === "loading" || raw === "empty" || raw === "error") return raw;
  return "normal";
}
