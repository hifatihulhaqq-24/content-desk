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
  Sparkles,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/data/states";
import { CONTENT_TYPES, CONTENT_TYPE_MAP } from "@/config/content-types";
import { getIdeationService } from "@/services/ideation-service";
import { cn } from "@/lib/utils";
import type { ContentTypeId } from "@/types/ideation";
import { SelectionSummary } from "./selection-summary";
import type { CreateFlow } from "./use-create-flow";

const ICONS = {
  FileText,
  Video,
  Image: ImageIcon,
  GalleryHorizontal,
};

interface StepAngleProps {
  flow: CreateFlow;
}

/** Step 2 — pilih 1 angle (R9) dan 1 tipe konten (R10/R11). */
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
      <SelectionSummary
        scenario={flow.scenario}
        topicTitle={flow.topicTitle}
        angleTitle={flow.angle?.title ?? null}
        contentType={flow.contentType}
      />

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">Pilih angle</h2>
            <p className="text-xs text-muted-foreground">
              {scenario === "recommended"
                ? "Angle disusun dari performa historis konten serupa."
                : "Angle disusun AI dari topik Anda dan sinyal tren terkini."}
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
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="mt-3 h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-5/6" />
                <Skeleton className="mt-4 h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : query.isError ? (
          <ErrorState onRetry={() => void query.refetch()} className="min-h-40" />
        ) : angles.length === 0 ? (
          <EmptyState
            title="Belum ada opsi angle"
            message="AI belum menghasilkan angle untuk topik ini. Coba buat ulang."
            className="min-h-40"
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {angles.map((option) => {
              const selected = flow.angle?.id === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => flow.requestSelection({ angle: option })}
                  aria-pressed={selected}
                  className={cn(
                    "flex flex-col rounded-xl border bg-card p-4 text-left shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                    selected
                      ? "border-primary ring-1 ring-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold">{option.title}</h3>
                    {selected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                        <Check className="size-3" aria-hidden /> Terpilih
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {option.description}
                  </p>
                  <p className="mt-3 inline-flex items-start gap-1.5 rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">
                    <Sparkles
                      className="mt-0.5 size-3.5 shrink-0 text-primary"
                      aria-hidden
                    />
                    {option.basis}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Tipe konten</h2>
          <p className="text-xs text-muted-foreground">
            Pilih satu tipe konten yang akan dibuat drafnya.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {CONTENT_TYPES.map((type) => {
            const Icon = ICONS[type.icon];
            const selected = flow.contentType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() =>
                  flow.requestSelection({ contentType: type.id as ContentTypeId })
                }
                aria-pressed={selected}
                className={cn(
                  "flex flex-col rounded-xl border bg-card p-4 text-left shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                  selected
                    ? "border-primary ring-1 ring-primary"
                    : "border-border hover:border-primary/40 hover:bg-muted/40"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg",
                      selected
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-4.5" aria-hidden />
                  </span>
                  {selected && (
                    <Check className="size-4 text-primary" aria-hidden />
                  )}
                </div>
                <h3 className="mt-3 text-sm font-semibold">
                  {CONTENT_TYPE_MAP[type.id].label}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {type.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={() => flow.goToStep(1)}>
          <ArrowLeft className="mr-1 size-4" aria-hidden />
          Kembali
        </Button>
        <div className="flex items-center gap-3">
          {flow.canAdvance ? null : (
            <span className="text-xs text-muted-foreground">
              Pilih satu angle dan satu tipe konten untuk melanjutkan.
            </span>
          )}
          <Button
            type="button"
            disabled={!flow.canAdvance}
            onClick={flow.advance}
          >
            Lanjut ke Draf Brief
            <ArrowRight className="ml-1 size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
