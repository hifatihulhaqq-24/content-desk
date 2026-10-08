"use client";

import Image from "next/image";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Kolase thumbnail konten dari aset mock yang sudah ada di repo. */
const COLLAGE = [
  { src: "/mock/bucket-01.jpg", className: "left-0 top-10 size-28 -rotate-6" },
  { src: "/mock/bucket-05.jpg", className: "left-24 top-2 size-32 rotate-3" },
  {
    src: "/mock/bucket-09.jpg",
    className: "left-[168px] top-14 size-24 rotate-6",
  },
] as const;

export interface BriefStats {
  total: number;
  draft: number;
  review: number;
  published: number;
}

const STAT_DOTS = [
  { key: "total", label: "brief", dot: "bg-[var(--chart-content)]" },
  { key: "draft", label: "draf", dot: "bg-[var(--chart-engagements)]" },
  { key: "review", label: "review", dot: "bg-[var(--chart-impressions)]" },
  { key: "published", label: "terbit", dot: "bg-positive" },
] as const;

interface BriefHeroProps {
  stats: BriefStats;
  onCreate: () => void;
  onSeeTopics: () => void;
}

/** Hero band landing Konten Brief — selalu tampil di atas area kerja. */
export function BriefHero({ stats, onCreate, onSeeTopics }: BriefHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-[color-mix(in_oklab,var(--chart-content)_8%,transparent)] via-card to-[color-mix(in_oklab,var(--chart-impressions)_10%,transparent)]">
      {/* Cincin konsentris dekoratif — motif dari referensi desain. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-8 top-1/2 hidden size-60 -translate-y-1/2 rounded-full border border-[color-mix(in_oklab,var(--chart-content)_22%,transparent)] md:block"
      >
        <div className="absolute inset-8 rounded-full border border-[color-mix(in_oklab,var(--chart-content)_16%,transparent)]" />
        <div className="absolute inset-16 rounded-full border border-[color-mix(in_oklab,var(--chart-impressions)_20%,transparent)]" />
      </div>

      <div className="relative grid gap-6 p-5 sm:p-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-8">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-[var(--chart-content)]" aria-hidden />
            Workspace Konten Brief
          </span>

          <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
            Dari topik yang panas,{" "}
            <span className="text-[var(--chart-content)]">
              jadi brief siap produksi
            </span>
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Rekomendasi topik tiap hari, ringkasan proyek tim, dan alur empat
            langkah dari insight sampai draf — semuanya ada di halaman ini.
          </p>

          <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {STAT_DOTS.map((item) => (
              <li key={item.key} className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className={cn("size-1.5 rounded-full", item.dot)}
                />
                <span>
                  <span className="font-semibold text-foreground">
                    {stats[item.key]}
                  </span>{" "}
                  {item.label}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button type="button" onClick={onCreate}>
              <Plus className="size-4" aria-hidden />
              Buat brief baru
            </Button>
            <Button type="button" variant="outline" onClick={onSeeTopics}>
              Lihat rekomendasi topik
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>

        {/* Kolase thumbnail — tumpuk di atas cincin. */}
        <div className="relative z-10 mx-auto hidden h-44 w-72 shrink-0 sm:block">
          {COLLAGE.map((item) => (
            <div
              key={item.src}
              className={cn(
                "absolute overflow-hidden rounded-2xl border-4 border-card shadow-lg",
                item.className
              )}
            >
              <Image
                src={item.src}
                alt=""
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
