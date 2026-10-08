"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CAROUSEL_ASPECT_OPTIONS } from "@/config/brief-options";
import type {
  BriefData,
  BriefSectionKey,
  CarouselDraft,
  SlideDraft,
} from "@/types/ideation";
import { MediaPreview } from "./media-preview";
import { BriefSectionCard, RegenerateButton } from "./section-card";

interface CarouselPanelProps {
  data: CarouselDraft;
  busy: boolean;
  onPatch: (
    section: BriefSectionKey,
    updater: (current: BriefData) => BriefData
  ) => void;
  onRegenerate: (section: BriefSectionKey) => void;
}

/** Sinkronkan jumlah slide dengan daftar slide. */
function syncSlides(
  slides: SlideDraft[],
  slideCount: number
): SlideDraft[] {
  if (slideCount < slides.length) return slides.slice(0, slideCount);
  const next = [...slides];
  while (next.length < slideCount) {
    const index = next.length;
    next.push({
      id: `slide-new-${index + 1}`,
      media: `Mock render slide ${index + 1}`,
      visualText: "",
    });
  }
  return next;
}

/** Panel draf Carousel (R21): jumlah slide, aspect ratio, media & teks per slide. */
export function CarouselPanel({
  data,
  busy,
  onPatch,
  onRegenerate,
}: CarouselPanelProps) {
  const [mediaBusy, setMediaBusy] = useState<string | null>(null);
  const altRef = useRef(0);
  const idRef = useRef(100);

  const patchCarousel = (
    section: BriefSectionKey,
    updater: (current: CarouselDraft) => CarouselDraft
  ) =>
    onPatch(section, (current) =>
      current.contentType === "carousel"
        ? { ...current, data: updater(current.data) }
        : current
    );

  const nextMediaLabel = (slide: SlideDraft) => {
    altRef.current += 1;
    return `${slide.media.split(" · ")[0]} · alt ${altRef.current}`;
  };

  const replaceMedia = (slideId: string) =>
    patchCarousel("slides", (current) => ({
      ...current,
      slides: current.slides.map((slide) =>
        slide.id === slideId
          ? { ...slide, media: nextMediaLabel(slide) }
          : slide
      ),
    }));

  const regenerateMedia = (slideId: string) => {
    if (mediaBusy) return;
    setMediaBusy(slideId);
    window.setTimeout(() => {
      replaceMedia(slideId);
      setMediaBusy(null);
    }, 700);
  };

  const moveSlide = (index: number, direction: -1 | 1) =>
    patchCarousel("slides", (current) => {
      const target = index + direction;
      if (target < 0 || target >= current.slides.length) return current;
      const slides = [...current.slides];
      [slides[index], slides[target]] = [slides[target], slides[index]];
      return { ...current, slides };
    });

  const removeSlide = (slideId: string) =>
    patchCarousel("slides", (current) => {
      if (current.slides.length <= 1) return current;
      const slides = current.slides.filter((slide) => slide.id !== slideId);
      return { ...current, slides, slideCount: slides.length };
    });

  const addSlide = () =>
    patchCarousel("slides", (current) => {
      idRef.current += 1;
      const slide: SlideDraft = {
        id: `slide-${idRef.current}`,
        media: `Mock render slide ${current.slides.length + 1}`,
        visualText: "",
      };
      return {
        ...current,
        slides: [...current.slides, slide],
        slideCount: current.slides.length + 1,
      };
    });

  return (
    <div className="space-y-4">
      <BriefSectionCard
        title="Pengaturan carousel"
        description="Jumlah slide dan aspect ratio seluruh slide."
        actions={
          <RegenerateButton
            busy={busy}
            onClick={() => onRegenerate("settings")}
          />
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="carousel-count">Jumlah slide</Label>
            <Select
              value={String(data.slideCount)}
              onValueChange={(value) =>
                patchCarousel("settings", (current) => {
                  const slideCount = Number(value);
                  return {
                    ...current,
                    slideCount,
                    slides: syncSlides(current.slides, slideCount),
                  };
                })
              }
              disabled={busy}
            >
              <SelectTrigger id="carousel-count">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7, 8].map((count) => (
                  <SelectItem key={count} value={String(count)}>
                    {count} slide
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="carousel-aspect">Aspect ratio</Label>
            <Select
              value={data.aspectRatio}
              onValueChange={(value) =>
                patchCarousel("settings", (current) => ({
                  ...current,
                  aspectRatio: value,
                }))
              }
              disabled={busy}
            >
              <SelectTrigger id="carousel-aspect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAROUSEL_ASPECT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </BriefSectionCard>

      <BriefSectionCard
        title={`Slide (${data.slides.length})`}
        description="Media render dan teks per slide — urutkan lewat tombol panah."
        actions={
          <RegenerateButton busy={busy} onClick={() => onRegenerate("slides")} />
        }
      >
        <ul className="space-y-3">
          {data.slides.map((slide, index) => (
            <li
              key={slide.id}
              className="rounded-lg border border-border bg-background p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  Slide {index + 1}
                </span>
                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Naikkan slide ${index + 1}`}
                    disabled={busy || index === 0}
                    onClick={() => moveSlide(index, -1)}
                  >
                    <ChevronUp className="size-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Turunkan slide ${index + 1}`}
                    disabled={busy || index === data.slides.length - 1}
                    onClick={() => moveSlide(index, 1)}
                  >
                    <ChevronDown className="size-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Hapus slide ${index + 1}`}
                    disabled={busy || data.slides.length <= 1}
                    onClick={() => removeSlide(slide.id)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-[220px_1fr]">
                <MediaPreview
                  label={slide.media}
                  aspect={data.aspectRatio}
                  ariaLabel={`Media render slide ${index + 1}`}
                  busy={mediaBusy === slide.id}
                  onReplace={() => replaceMedia(slide.id)}
                  onRegenerate={() => regenerateMedia(slide.id)}
                />
                <div className="space-y-1.5">
                  <Label htmlFor={`${slide.id}-text`}>Teks slide</Label>
                  <Textarea
                    id={`${slide.id}-text`}
                    value={slide.visualText}
                    rows={3}
                    disabled={busy}
                    placeholder="Teks yang tampil pada slide ini…"
                    onChange={(event) =>
                      patchCarousel("slides", (current) => ({
                        ...current,
                        slides: current.slides.map((row) =>
                          row.id === slide.id
                            ? { ...row, visualText: event.target.value }
                            : row
                        ),
                      }))
                    }
                    className="resize-y"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-3"
          disabled={busy}
          onClick={addSlide}
        >
          <Plus className="size-4" aria-hidden /> Tambah slide
        </Button>
      </BriefSectionCard>
    </div>
  );
}
