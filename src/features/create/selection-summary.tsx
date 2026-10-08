"use client";

import type { ContentTypeId, EntryScenario } from "@/types/ideation";
import { contentTypeLabel } from "@/config/content-types";

interface SelectionSummaryProps {
  scenario: EntryScenario | null;
  topicTitle: string;
  angleTitle?: string | null;
  contentType?: ContentTypeId | null;
  /** Ringkasan aset terpilih (Step 3–4). */
  assetSummary?: string | null;
}

function Chip({ label, value }: { label: string; value: string | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={value ? "font-medium text-foreground" : "text-muted-foreground/70"}>
        {value ?? "—"}
      </span>
    </span>
  );
}

/** Ringkasan pilihan (R12) — tampil di Step 2 sampai Step 4. */
export function SelectionSummary({
  scenario,
  topicTitle,
  angleTitle,
  contentType,
  assetSummary = null,
}: SelectionSummaryProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-xs">
      <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Ringkasan pilihan
      </span>
      <Chip label="Topik" value={topicTitle || null} />
      <Chip
        label="Skenario"
        value={
          scenario === "recommended"
            ? "Dari rekomendasi"
            : scenario === "custom"
              ? "Topik sendiri"
              : null
        }
      />
      <Chip label="Angle" value={angleTitle ?? null} />
      <Chip
        label="Format"
        value={contentType ? contentTypeLabel(contentType) : null}
      />
      <Chip label="Aset" value={assetSummary} />
    </div>
  );
}
