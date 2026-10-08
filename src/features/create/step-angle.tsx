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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/data/states";
import { CONTENT_TYPE_MAP } from "@/config/content-types";
import { getIdeationService } from "@/services/ideation-service";
import { cn } from "@/lib/utils";
import { SelectionSummary } from "./selection-summary";
import type { CreateFlow } from "./use-create-flow";

const ICONS = {
  FileText,
  Video,
  Image: ImageIcon,
  GalleryHorizontal,
} as const;

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
                ? "Angle disusun dari performa historis konten serupa — setiap angle mengunci satu format konten."
                : "Angle disusun AI dari topik Anda dan sinyal tren terkini — setiap angle mengunci satu format konten."}
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
              const typeInfo = CONTENT_TYPE_MAP[option.contentType];
              const TypeIcon = ICONS[typeInfo.icon];
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
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
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
                  <Badge variant="secondary" className="mt-3 self-start text-xs">
                    <TypeIcon className="size-3.5" aria-hidden />
                    {typeInfo.label}
                  </Badge>
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
