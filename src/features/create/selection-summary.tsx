"use client";

import type { ContentTypeId, EntryScenario } from "@/types/ideation";
import { contentTypeLabel } from "@/config/content-types";
import { cn } from "@/lib/utils";

interface SelectionSummaryProps {
  scenario: EntryScenario | null;
  topicTitle: string;
  angleTitle?: string | null;
  contentType?: ContentTypeId | null;
  /** Ringkasan aset terpilih (Step 3–4). */
  assetSummary?: string | null;
  /**
   * `rail` — daftar label/nilai vertikal untuk rail kiri /create (lg+).
   * `chip` — baris chip horizontal untuk fallback mobile.
   */
  variant?: "rail" | "chip";
}

function Chip({ label, value }: { label: string; value: string | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "max-w-44 truncate",
          value ? "font-medium text-foreground" : "text-muted-foreground/70"
        )}
      >
        {value ?? "—"}
      </span>
    </span>
  );
}

function summaryRowsOf(props: SelectionSummaryProps) {
  return [
    { key: "topik", label: "Topik", value: props.topicTitle || null },
    {
      key: "skenario",
      label: "Skenario",
      value:
        props.scenario === "recommended"
          ? "Dari rekomendasi"
          : props.scenario === "custom"
            ? "Topik sendiri"
            : null,
    },
    { key: "angle", label: "Angle", value: props.angleTitle ?? null },
    {
      key: "format",
      label: "Format",
      value: props.contentType ? contentTypeLabel(props.contentType) : null,
    },
    { key: "aset", label: "Aset", value: props.assetSummary ?? null },
  ];
}

/** Ringkasan pilihan (R12) — rail kiri di lg+, chip di layar kecil. */
export function SelectionSummary({
  variant = "chip",
  ...props
}: SelectionSummaryProps) {
  const rows = summaryRowsOf(props);

  if (variant === "rail") {
    return (
      <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Ringkasan pilihan
        </h2>
        <dl className="mt-3 space-y-2.5">
          {rows.map((row) => (
            <div
              key={row.key}
              className="flex items-baseline justify-between gap-3"
            >
              <dt className="shrink-0 text-xs text-muted-foreground">
                {row.label}
              </dt>
              <dd
                title={row.value ?? undefined}
                className={cn(
                  "min-w-0 truncate text-right text-xs",
                  row.value
                    ? "font-medium text-foreground"
                    : "text-muted-foreground/70"
                )}
              >
                {row.value ?? "—"}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-xs">
      <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Ringkasan pilihan
      </span>
      {rows.map((row) => (
        <Chip key={row.key} label={row.label} value={row.value} />
      ))}
    </div>
  );
}
