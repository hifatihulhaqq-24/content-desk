"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  GalleryHorizontal,
  Image as ImageIcon,
  RotateCw,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/data/states";
import { CONTENT_TYPE_MAP } from "@/config/content-types";
import { getIdeationService } from "@/services/ideation-service";
import { cn } from "@/lib/utils";
import type { CreateFlow } from "./use-create-flow";
import type { ContentTypeId } from "@/types/ideation";

const ICONS = {
  FileText,
  Video,
  Image: ImageIcon,
  GalleryHorizontal,
} as const;

/** Tile format — warna dari token chart per tipe konten. */
const TYPE_TINTS: Record<ContentTypeId, string> = {
  article:
    "bg-[color-mix(in_oklab,var(--chart-block-content)_15%,transparent)] text-[var(--chart-block-content)] dark:text-chart-1",
  video:
    "bg-[color-mix(in_oklab,var(--chart-impressions)_15%,transparent)] text-[var(--chart-impressions-dark)] dark:text-chart-2",
  image:
    "bg-[color-mix(in_oklab,var(--chart-content)_13%,transparent)] text-[var(--chart-content)] dark:text-chart-3",
  carousel:
    "bg-[color-mix(in_oklab,var(--chart-engagements)_15%,transparent)] text-[var(--chart-engagements-dark)] dark:text-chart-4",
};

interface StepAngleProps {
  flow: CreateFlow;
}

/** Step 2 — pilih 1 angle (R9); setiap angle mengunci 1 format konten (R10/R11). */
export function StepAngle({ flow }: StepAngleProps) {
  const topicTitle = flow.topicTitle;
  const scenario = flow.scenario ?? "recommended";

  const query = useQuery({
    queryKey: ["ideation-angles", topicTitle, scenario],
    queryFn: () =>
      getIdeationService().generateAngles({ topic: topicTitle, scenario }),
    enabled: topicTitle.length > 0,
  });

  const angles = query.data ?? [];

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">Pilih angle</h2>
            <p className="text-xs text-muted-foreground">
              {scenario === "recommended"
                ? "Disusun dari performa historis konten serupa di cluster yang sama."
                : "Disusun dari topikmu dan sinyal tren terkini."}
            </p>
          </div>
          {query.isSuccess && angles.length > 0 && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => void query.refetch()}
              disabled={query.isFetching}
            >
              <RotateCw
                className={cn("size-4", query.isFetching && "animate-spin")}
                aria-hidden
              />
              Buat ulang opsi
            </Button>
          )}
        </div>

        {query.isPending ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-card p-4 shadow-xs"
              >
                <div className="flex gap-4">
                  <Skeleton className="size-14 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="mt-2 h-3 w-full" />
                    <Skeleton className="mt-2 h-3 w-5/6" />
                  </div>
                </div>
                <Skeleton className="mt-4 h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : query.isError ? (
          <ErrorState onRetry={() => void query.refetch()} className="min-h-40" />
        ) : angles.length === 0 ? (
          <EmptyState
            title="Belum ada opsi angle"
            message="Belum ada angle yang dihasilkan untuk topik ini. Coba buat ulang."
            className="min-h-40"
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {angles.map((option) => {
              const selected = flow.angle?.id === option.id;
              const typeInfo = CONTENT_TYPE_MAP[option.contentType];
              const TypeIcon = ICONS[typeInfo.icon];
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => flow.requestSelection({ angle: option })}
                  aria-pressed={selected}
                  className={cn(
                    "group flex gap-4 rounded-xl border bg-card p-4 text-left shadow-xs",
                    "transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring",
                    selected
                      ? "border-primary ring-1 ring-primary"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-14 shrink-0 items-center justify-center rounded-xl",
                      TYPE_TINTS[option.contentType]
                    )}
                  >
                    <TypeIcon className="size-6" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold leading-snug">
                        {option.title}
                      </h3>
                      {selected && (
                        <span
                          aria-hidden
                          className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        >
                          <Check className="size-3" />
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {option.description}
                    </p>

                    <p className="mt-3 border-l-2 border-[color-mix(in_oklab,var(--chart-content)_35%,transparent)] pl-2 text-xs italic text-muted-foreground">
                      {option.basis}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-xs"
                      >
                        <TypeIcon className="size-3.5" aria-hidden />
                        {typeInfo.label}
                      </Badge>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium transition-colors",
                          selected
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-primary"
                        )}
                      >
                        Pakai angle ini
                        <ArrowRight className="size-3.5" aria-hidden />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={() => flow.goToStep(1)}>
          <ArrowLeft className="mr-1 size-4" aria-hidden />
          Kembali
        </Button>
        <div className="flex items-center gap-3">
          {flow.canAdvance ? null : (
            <span className="text-xs text-muted-foreground">
              Pilih satu angle untuk melanjutkan.
            </span>
          )}
          <Button
            type="button"
            disabled={!flow.canAdvance}
            onClick={flow.advance}
          >
            Lanjut ke Kesiapan Aset
            <ArrowRight className="ml-1 size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
