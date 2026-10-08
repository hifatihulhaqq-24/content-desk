"use client";

import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { EmptyState, ErrorState } from "@/components/data/states";
import { PlatformIcon } from "@/components/icons/platform-icon";
import { Skeleton } from "@/components/ui/skeleton";
import type { QueryUiState } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";
import { formatCompact } from "@/lib/format";
import { EXTERNAL_LINK_PROPS, postUrl } from "@/lib/content-links";
import type { ContentBucket, ContentBucketKey } from "@/types/analytics";

const BUCKET_ICONS: Record<ContentBucketKey, ReactNode> = {
  breakout: <TrendingUp className="size-4" aria-hidden />,
  growing: <ArrowUpRight className="size-4" aria-hidden />,
  lowLight: <TrendingDown className="size-4" aria-hidden />,
};

/** Gambar dummy lokal (Unsplash bebas lisensi) di /public/mock. */
const BUCKET_IMAGES = [
  "/mock/bucket-01.jpg",
  "/mock/bucket-02.jpg",
  "/mock/bucket-03.jpg",
  "/mock/bucket-04.jpg",
  "/mock/bucket-05.jpg",
  "/mock/bucket-06.jpg",
  "/mock/bucket-07.jpg",
  "/mock/bucket-08.jpg",
  "/mock/bucket-09.jpg",
  "/mock/bucket-10.jpg",
  "/mock/bucket-11.jpg",
  "/mock/bucket-12.jpg",
];

/** Pemilihan gambar deterministik per post (stable lint hash). */
function imageForPost(postId: string): string {
  let hash = 0;
  for (let i = 0; i < postId.length; i++) {
    hash = (hash * 31 + postId.charCodeAt(i)) >>> 0;
  }
  return BUCKET_IMAGES[hash % BUCKET_IMAGES.length];
}

interface ContentBucketsSectionProps {
  status: QueryUiState;
  buckets: ContentBucket[];
  onRetry: () => void;
}

function BucketSkeleton() {
  return (
    <div className="rounded-xl bg-card p-4 shadow-xs">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-2 h-3 w-40" />
      <div className="mt-4 divide-y divide-border">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 py-4">
            <Skeleton className="size-16 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContentBucketsSection({
  status,
  buckets,
  onRetry,
}: ContentBucketsSectionProps) {
  if (status === "error") {
    return <ErrorState onRetry={onRetry} className="min-h-56" />;
  }

  if (status === "loading") {
    return (
      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <BucketSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (status === "empty" || buckets.every((bucket) => bucket.posts.length === 0)) {
    return (
      <EmptyState
        title="Belum ada konten"
        message="Belum ada konten terbit pada periode ini."
      />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {buckets.map((bucket) => (
        <section
          key={bucket.key}
          className="flex flex-col rounded-xl bg-card p-4 text-card-foreground shadow-xs"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-md",
                  bucket.key === "breakout" && "bg-primary/10 text-primary",
                  bucket.key === "growing" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  bucket.key === "lowLight" && "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                )}
              >
                {BUCKET_ICONS[bucket.key]}
              </span>
              {bucket.label}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
              {bucket.posts.length} konten
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {bucket.description}
          </p>

          {bucket.posts.length === 0 ? (
            <EmptyState
              title="Tidak ada konten"
              message="Tidak ada konten yang masuk kategori ini."
              className="mt-4 flex-1"
            />
          ) : (
            <ul className="mt-3 flex-1 divide-y divide-border">
              {bucket.posts.map((post) => (
                <li key={post.id}>
                  <a
                    href={postUrl(post)}
                    {...EXTERNAL_LINK_PROPS}
                    className="-mx-1 group flex items-center gap-3 rounded-md px-1 py-3 transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={imageForPost(post.id)}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                      <span
                        className="absolute bottom-1 left-1 rounded bg-black/55 p-1 text-white"
                        title={post.platform}
                      >
                        <PlatformIcon
                          platform={post.platform}
                          className="size-3.5"
                        />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm group-hover:underline underline-offset-2">{post.caption}</p>
                      <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                        Views{" "}
                        <b className="font-medium text-foreground">
                          {formatCompact(post.metrics.views)}
                        </b>
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
