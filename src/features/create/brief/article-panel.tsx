"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import type { ArticleDraft, BriefData, BriefSectionKey } from "@/types/ideation";
import { BriefSectionCard, RegenerateButton } from "./section-card";

interface ArticlePanelProps {
  data: ArticleDraft;
  busy: boolean;
  onPatch: (
    section: BriefSectionKey,
    updater: (current: BriefData) => BriefData
  ) => void;
  onRegenerate: (section: BriefSectionKey) => void;
}

/** Panel draf Artikel (R24): judul, outline, editor rich text. */
export function ArticlePanel({
  data,
  busy,
  onPatch,
  onRegenerate,
}: ArticlePanelProps) {
  const patchBody = (updater: (current: BriefData) => BriefData) =>
    onPatch("body", (current) =>
      current.contentType === "article" ? updater(current) : current
    );

  return (
    <div className="space-y-4">
      <BriefSectionCard
        title="Judul"
        description="Judul utama draf artikel."
        actions={
          <RegenerateButton
            busy={busy}
            onClick={() => onRegenerate("headline")}
          />
        }
      >
        <Label htmlFor="article-headline" className="sr-only">
          Judul artikel
        </Label>
        <Input
          id="article-headline"
          value={data.headline}
          disabled={busy}
          onChange={(event) =>
            onPatch("headline", (current) =>
              current.contentType === "article"
                ? {
                    ...current,
                    data: { ...current.data, headline: event.target.value },
                  }
                : current
            )
          }
        />
      </BriefSectionCard>

      <BriefSectionCard
        title="Outline / subjudul"
        description="Struktur bagian artikel — bisa disunting bebas."
        actions={
          <RegenerateButton busy={busy} onClick={() => onRegenerate("outline")} />
        }
      >
        <ul className="space-y-2">
          {data.outline.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">
                {index + 1}.
              </span>
              <Label htmlFor={`article-outline-${index}`} className="sr-only">
                Subjudul {index + 1}
              </Label>
              <Input
                id={`article-outline-${index}`}
                value={item}
                disabled={busy}
                onChange={(event) =>
                  onPatch("outline", (current) =>
                    current.contentType === "article"
                      ? {
                          ...current,
                          data: {
                            ...current.data,
                            outline: current.data.outline.map((row, i) =>
                              i === index ? event.target.value : row
                            ),
                          },
                        }
                      : current
                  )
                }
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Hapus subjudul ${index + 1}`}
                disabled={busy || data.outline.length <= 1}
                onClick={() =>
                  onPatch("outline", (current) =>
                    current.contentType === "article"
                      ? {
                          ...current,
                          data: {
                            ...current.data,
                            outline: current.data.outline.filter(
                              (_, i) => i !== index
                            ),
                          },
                        }
                      : current
                  )
                }
              >
                <X className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-2"
          disabled={busy}
          onClick={() =>
            onPatch("outline", (current) =>
              current.contentType === "article"
                ? {
                    ...current,
                    data: {
                      ...current.data,
                      outline: [...current.data.outline, "Subjudul baru"],
                    },
                  }
                : current
            )
          }
        >
          <Plus className="size-4" aria-hidden /> Tambah subjudul
        </Button>
      </BriefSectionCard>

      <BriefSectionCard
        title="Isi artikel"
        description="Pratinjau hasil AI — edit langsung di editor."
        actions={
          <RegenerateButton busy={busy} onClick={() => onRegenerate("body")} />
        }
      >
        <RichTextEditor
          value={data.body}
          aria-label="Isi artikel"
          onChange={(html) =>
            patchBody((current) =>
              current.contentType === "article"
                ? { ...current, data: { ...current.data, body: html } }
                : current
            )
          }
        />
      </BriefSectionCard>
    </div>
  );
}
