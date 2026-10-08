"use client";

import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AVATAR_OPTIONS,
  IMAGE_ASPECT_OPTIONS,
} from "@/config/brief-options";
import type {
  BriefData,
  BriefSectionKey,
  ImageDraft,
} from "@/types/ideation";
import { BriefSectionCard, RegenerateButton } from "./section-card";
import { MediaPreview } from "./media-preview";

interface ImagePanelProps {
  data: ImageDraft;
  busy: boolean;
  onPatch: (
    section: BriefSectionKey,
    updater: (current: BriefData) => BriefData
  ) => void;
  onRegenerate: (section: BriefSectionKey) => void;
}

/** Panel draf Image (R19–R20): pengaturan + media render + teks visual. */
export function ImagePanel({
  data,
  busy,
  onPatch,
  onRegenerate,
}: ImagePanelProps) {
  const [mediaBusy, setMediaBusy] = useState(false);
  const altRef = useRef(0);

  const patchImage = (
    section: BriefSectionKey,
    updater: (current: ImageDraft) => ImageDraft
  ) =>
    onPatch(section, (current) =>
      current.contentType === "image"
        ? { ...current, data: updater(current.data) }
        : current
    );

  const nextMediaLabel = () => {
    altRef.current += 1;
    return `${data.media.split(" · ")[0]} · alt ${altRef.current}`;
  };

  const regenerateMedia = () => {
    if (mediaBusy) return;
    setMediaBusy(true);
    window.setTimeout(() => {
      patchImage("visual", (current) => ({
        ...current,
        media: nextMediaLabel(),
      }));
      setMediaBusy(false);
    }, 700);
  };

  return (
    <div className="space-y-4">
      <BriefSectionCard
        title="Pengaturan umum"
        description="Aspect ratio gambar dan pilihan avatar (jika relevan / Full AI)."
        actions={
          <RegenerateButton
            busy={busy}
            onClick={() => onRegenerate("settings")}
          />
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="image-aspect">Aspect ratio</Label>
            <Select
              value={data.aspectRatio}
              onValueChange={(value) =>
                patchImage("settings", (current) => ({
                  ...current,
                  aspectRatio: value,
                }))
              }
              disabled={busy}
            >
              <SelectTrigger id="image-aspect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMAGE_ASPECT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="image-avatar">Avatar</Label>
            <Select
              value={data.avatar}
              onValueChange={(value) =>
                patchImage("settings", (current) => ({
                  ...current,
                  avatar: value,
                }))
              }
              disabled={busy}
            >
              <SelectTrigger id="image-avatar">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVATAR_OPTIONS.map((option) => (
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
        title="Informasi gambar"
        description="Media render dengan aksi ganti/generate ulang, plus teks visual di atas gambar."
        actions={
          <RegenerateButton busy={busy} onClick={() => onRegenerate("visual")} />
        }
      >
        <div className="grid gap-4 sm:grid-cols-[minmax(0,260px)_1fr]">
          <div className="space-y-2">
            <MediaPreview
              label={data.media}
              aspect={data.aspectRatio}
              ariaLabel="Media render image"
              busy={mediaBusy}
              onReplace={() =>
                patchImage("visual", (current) => ({
                  ...current,
                  media: nextMediaLabel(),
                }))
              }
              onRegenerate={regenerateMedia}
            />
            <p className="text-xs text-muted-foreground">
              Aspect ratio {data.aspectRatio} · {data.avatar}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="image-visual-text">Teks visual pada gambar</Label>
            <Textarea
              id="image-visual-text"
              value={data.visualText}
              rows={5}
              disabled={busy}
              placeholder="Teks, elemen, atau komposisi yang diinginkan…"
              onChange={(event) =>
                patchImage("visual", (current) => ({
                  ...current,
                  visualText: event.target.value,
                }))
              }
              className="resize-y"
            />
          </div>
        </div>
      </BriefSectionCard>
    </div>
  );
}
