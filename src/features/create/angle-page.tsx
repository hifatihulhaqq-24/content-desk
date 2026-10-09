"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/data/states";
import { PageContainer } from "@/components/layout/page-container";
import { CONTENT_TYPES, CONTENT_TYPE_MAP } from "@/config/content-types";
import { getIdeationService } from "@/services/ideation-service";
import { cn } from "@/lib/utils";
import type { ContentTypeId } from "@/types/ideation";
import { useCreateFlowContext } from "./create-flow-context";
import { AngleCard } from "./angle-card";
import { AssetPanel } from "./asset-panel";

type FormatFilter = ContentTypeId | "all";

const FORMAT_FILTERS: { id: FormatFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  ...CONTENT_TYPES.map((type) => ({ id: type.id, label: type.label })),
];

/**
 * Halaman /create/angle — pilih angle (kartu gaya marketplace) dan lengkapi
 * aset & referensi. Klik kartu hanya menandai pilihan; lanjut ke draf lewat
 * tombol "Generate Draft" yang selalu tampil di bawah halaman.
 */
export function AnglePage() {
  const router = useRouter();
  const { flow } = useCreateFlowContext();
  const [format, setFormat] = useState<FormatFilter>("all");

  const topicTitle = flow.topicTitle;
  const scenario = flow.scenario ?? "recommended";
  const imageCount = flow.referenceContext.imageCount;
  const linksKey = flow.links.join("|");

  const query = useQuery({
    queryKey: ["ideation-angles", topicTitle, scenario, imageCount, linksKey],
    queryFn: () =>
      getIdeationService().generateAngles({
        topic: topicTitle,
        scenario,
        imageCount,
        links: flow.links,
      }),
    enabled: topicTitle.length > 0,
  });

  // Direct load / refresh tanpa state flow → kembali ke halaman compose.
  useEffect(() => {
    if (!topicTitle) router.replace("/create");
  }, [topicTitle, router]);

  if (!topicTitle) return null;

  const angles = query.data ?? [];
  const visible =
    format === "all" ? angles : angles.filter((item) => item.contentType === format);
  const contextSummary = flow.contextSummary.join(" & ");

  return (
    <PageContainer>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push("/create")}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Kembali ke topik
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={flow.restart}>
          Mulai ulang
        </Button>
      </div>

      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Pilih angle</h1>
        <p className="text-sm text-muted-foreground">
          Untuk topik “{topicTitle}”
          {contextSummary ? ` · ${contextSummary} yang kamu lampirkan` : ""}.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">Angle rekomendasi</h2>
            <p className="text-xs text-muted-foreground">
              {contextSummary
                ? `Disusun dari topik, ${contextSummary} yang kamu sertakan — setiap angle mengunci satu format konten.`
                : scenario === "recommended"
                  ? "Disusun dari performa historis konten serupa di cluster yang sama — setiap angle mengunci satu format konten."
                  : "Disusun dari topikmu dan sinyal tren terkini — setiap angle mengunci satu format konten."}
            </p>
          </div>
        </div>

        {/* Toolbar: filter format + buat ulang */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Filter format angle"
            className="flex flex-wrap gap-1.5"
          >
            {FORMAT_FILTERS.map((item) => {
              const active = format === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFormat(item.id)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
          >
            <RotateCw
              className={cn("size-3.5", query.isFetching && "animate-spin")}
              aria-hidden
            />
            Buat ulang opsi
          </Button>
        </div>

        {query.isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-card p-4 shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="size-10 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="mt-2 h-3 w-1/3" />
                  </div>
                </div>
                <Skeleton className="mt-4 h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-5/6" />
                <Skeleton className="mt-4 h-4 w-32" />
              </div>
            ))}
          </div>
        ) : query.isError ? (
          <ErrorState
            onRetry={() => void query.refetch()}
            className="min-h-40"
          />
        ) : angles.length === 0 ? (
          <EmptyState
            title="Belum ada opsi angle"
            message="Belum ada angle yang dihasilkan untuk topik ini. Coba buat ulang."
            className="min-h-40"
          />
        ) : visible.length === 0 ? (
          <EmptyState
            title={`Belum ada angle format ${CONTENT_TYPE_MAP[format as ContentTypeId]?.label ?? format}`}
            message="Tidak ada opsi untuk format ini — pilih “Semua” atau buat ulang opsi."
            className="min-h-40"
            action={
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setFormat("all")}
              >
                Tampilkan semua format
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((option) => (
              <AngleCard
                key={option.id}
                option={option}
                selected={flow.angle?.id === option.id}
                attachmentsLabel={contextSummary || null}
                onSelect={() => flow.selectAngle(option)}
              />
            ))}
          </div>
        )}
      </section>

      <AssetPanel flow={flow} />

      {/* Aksi lanjut — selalu tampil agar mudah terlihat, aktif setelah angle dipilih. */}
      <div className="sticky bottom-4 z-10 flex justify-end">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 shadow-md">
          <p className="hidden text-xs text-muted-foreground sm:block">
            {flow.angle ? (
              <>
                Terpilih:{" "}
                <span className="font-medium text-foreground">
                  {flow.angle.title}
                </span>
              </>
            ) : (
              "Pilih salah satu angle untuk melanjutkan"
            )}
          </p>
          <Button
            type="button"
            size="sm"
            onClick={flow.goToBrief}
            disabled={!flow.angle}
          >
            Generate Draft
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
