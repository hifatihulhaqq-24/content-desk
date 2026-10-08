"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Film,
  FolderOpen,
  ImageIcon,
  Search,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/data/states";
import { getIdeationService } from "@/services/ideation-service";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/format";
import type { UploadedMediaItem } from "@/types/ideation";
import { SelectionSummary } from "./selection-summary";
import type { CreateFlow } from "./use-create-flow";

interface StepAssetProps {
  flow: CreateFlow;
}

const CATEGORIES = ["infografis", "foto", "video", "data", "produk"];

/** Status unggahan per file (mock: naik ke 100% dalam beberapa ratus ms). */
function UploadRow({
  file,
  onRemove,
}: {
  file: UploadedMediaItem;
  onRemove: () => void;
}) {
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          window.clearInterval(timer);
          return 100;
        }
        return Math.min(100, value + 25);
      });
    }, 120);
    return () => window.clearInterval(timer);
  }, [file.id]);

  const done = progress >= 100;

  return (
    <li className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {file.type === "video" ? (
          <Film className="size-4" aria-hidden />
        ) : file.type === "image" ? (
          <ImageIcon className="size-4" aria-hidden />
        ) : (
          <FileText className="size-4" aria-hidden />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{file.name}</span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatBytes(file.size)}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <Progress
            value={progress}
            className="h-1.5 flex-1"
            aria-label={`Progres unggah ${file.name}`}
          />
          <span
            className={cn(
              "shrink-0 text-xs",
              done ? "text-positive" : "text-muted-foreground"
            )}
          >
            {done ? "Siap" : "Mengunggah…"}
          </span>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        aria-label={`Hapus ${file.name}`}
      >
        <X className="size-4" aria-hidden />
      </Button>
    </li>
  );
}

/** Step 3 — kesiapan aset (R8): upload materi sendiri atau pilih dari DAM. */
export function StepAsset({ flow }: StepAssetProps) {
  const [dragOver, setDragOver] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const assetsQuery = useQuery({
    queryKey: [
      "internal-assets",
      flow.topicTitle,
      flow.angle?.id ?? "",
      flow.contentType ?? "",
      deferredSearch,
      category ?? "",
    ],
    queryFn: () =>
      getIdeationService().searchInternalAssets({
        topic: flow.topicTitle,
        angleId: flow.angle?.id,
        contentType: flow.contentType ?? undefined,
        query: deferredSearch,
        category: category ?? undefined,
      }),
    enabled: flow.assetMode === "directory",
  });

  const assets = assetsQuery.data ?? [];

  const handleFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    flow.addUploadedFiles(Array.from(list));
  };

  return (
    <div className="space-y-6">
      <SelectionSummary
        scenario={flow.scenario}
        topicTitle={flow.topicTitle}
        angleTitle={flow.angle?.title ?? null}
        contentType={flow.contentType}
        assetSummary={flow.assetSummary}
      />

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">
            Apakah Anda punya materi/aset?
          </h2>
          <p className="text-xs text-muted-foreground">
            Materi yang tersedia membantu AI menyusun brief yang lebih relevan.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => flow.setAssetMode("upload")}
            aria-pressed={flow.assetMode === "upload"}
            className={cn(
              "flex flex-col rounded-xl border bg-card p-4 text-left shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              flow.assetMode === "upload"
                ? "border-primary ring-1 ring-primary"
                : "border-border hover:border-primary/40 hover:bg-muted/40"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg",
                  flow.assetMode === "upload"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Upload className="size-4" aria-hidden />
              </span>
              {flow.assetMode === "upload" && (
                <Check className="size-4 text-primary" aria-hidden />
              )}
            </div>
            <h3 className="mt-3 text-sm font-semibold">Sudah punya</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Unggah dokumen, gambar, atau video yang sudah Anda siapkan.
            </p>
          </button>

          <button
            type="button"
            onClick={() => flow.setAssetMode("directory")}
            aria-pressed={flow.assetMode === "directory"}
            className={cn(
              "flex flex-col rounded-xl border bg-card p-4 text-left shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              flow.assetMode === "directory"
                ? "border-primary ring-1 ring-primary"
                : "border-border hover:border-primary/40 hover:bg-muted/40"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg",
                  flow.assetMode === "directory"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <FolderOpen className="size-4" aria-hidden />
              </span>
              {flow.assetMode === "directory" && (
                <Check className="size-4 text-primary" aria-hidden />
              )}
            </div>
            <h3 className="mt-3 text-sm font-semibold">Belum punya</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Cari aset internal DAM yang paling relevan dengan topik ini.
            </p>
          </button>
        </div>
      </section>

      {flow.assetMode === "upload" && (
        <section className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-xs">
          <div>
            <h3 className="text-sm font-semibold">Unggah materi</h3>
            <p className="text-xs text-muted-foreground">
              Drag & drop atau pilih file — gambar, video, atau dokumen (maks
              50&nbsp;MB per file).
            </p>
          </div>

          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              handleFiles(event.dataTransfer.files);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/40 px-6 py-8 text-center transition-colors hover:border-primary/40",
              dragOver && "border-primary bg-primary/10"
            )}
          >
            <Upload className="size-5 text-muted-foreground" aria-hidden />
            <span className="mt-2 text-sm font-medium">
              Jatuhkan file di sini atau klik untuk memilih
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              Mendukung gambar, video, dan dokumen
            </span>
            <Input
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              className="sr-only"
              aria-label="Pilih file materi"
              onChange={(event) => {
                handleFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>

          {flow.uploadedFiles.length > 0 ? (
            <ul className="space-y-3">
              {flow.uploadedFiles.map((file) => (
                <UploadRow
                  key={file.id}
                  file={file}
                  onRemove={() => flow.removeUploadedFile(file.id)}
                />
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Belum ada file"
              message="Unggah minimal satu file untuk melanjutkan."
              className="min-h-32"
            />
          )}
        </section>
      )}

      {flow.assetMode === "directory" && (
        <section className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">Aset internal DAM</h3>
              <p className="text-xs text-muted-foreground">
                Pilih aset yang paling relevan — skor kecocokan dihitung dari
                topik dan angle terpilih.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari aset…"
                aria-label="Cari aset internal"
                className="pl-8"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory(null)}
              aria-pressed={category === null}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                category === null
                  ? "border-primary bg-primary/10 font-medium text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              )}
            >
              Semua
            </button>
            {CATEGORIES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                aria-pressed={category === value}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs capitalize transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                  category === value
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                {value}
              </button>
            ))}
          </div>

          {assetsQuery.isPending ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-card p-4 shadow-xs"
                >
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="mt-3 h-4 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : assetsQuery.isError ? (
            <ErrorState
              onRetry={() => void assetsQuery.refetch()}
              className="min-h-40"
            />
          ) : assets.length === 0 ? (
            <EmptyState
              title="Aset tidak ditemukan"
              message="Tidak ada aset yang cocok. Coba kata kunci atau kategori lain."
              className="min-h-40"
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {assets.map((asset) => {
                const selected = flow.selectedInternalAssetIds.includes(
                  asset.id
                );
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => flow.toggleInternalAsset(asset.id)}
                    aria-pressed={selected}
                    className={cn(
                      "flex flex-col overflow-hidden rounded-xl border bg-card p-0 text-left shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                      selected
                        ? "border-primary ring-1 ring-primary"
                        : "border-border hover:border-primary/40 hover:bg-muted/40"
                    )}
                  >
                    <span className="relative block w-full overflow-hidden rounded-t-xl bg-muted/60">
                      {/* Thumbnail mock lokal — bukan media produksi. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.thumbnailUrl}
                        alt=""
                        className="aspect-video w-full object-cover"
                      />
                      <span className="absolute right-2 top-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Cocok {asset.matchScore}
                      </span>
                      {selected && (
                        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                          <Check className="size-3" aria-hidden /> Terpilih
                        </span>
                      )}
                    </span>
                    <span className="flex flex-col gap-2 p-3">
                      <span className="line-clamp-2 text-sm font-semibold">
                        {asset.title}
                      </span>
                      <span className="flex flex-wrap gap-1">
                        {asset.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {asset.resolution} ·{" "}
                        {asset.type === "video" ? "Video" : "Gambar"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={() => flow.goToStep(2)}>
          <ArrowLeft className="mr-1 size-4" aria-hidden />
          Kembali
        </Button>
        <div className="flex items-center gap-3">
          {flow.canAdvance ? null : (
            <span className="text-xs text-muted-foreground">
              {flow.assetMode === null
                ? "Pilih salah satu cara menyiapkan aset untuk melanjutkan."
                : flow.assetMode === "upload"
                  ? "Unggah minimal satu file untuk melanjutkan."
                  : "Pilih minimal satu aset DAM untuk melanjutkan."}
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
