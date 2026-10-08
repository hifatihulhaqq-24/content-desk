"use client";

import { useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DURATION_OPTIONS,
  VIDEO_ASPECT_OPTIONS,
} from "@/config/brief-options";
import type {
  BriefData,
  BriefSectionKey,
  SceneDraft,
  VideoDraft,
} from "@/types/ideation";
import { BriefSectionCard, RegenerateButton } from "./section-card";
import { MediaPreview } from "./media-preview";

interface VideoPanelProps {
  data: VideoDraft;
  busy: boolean;
  onPatch: (
    section: BriefSectionKey,
    updater: (current: BriefData) => BriefData
  ) => void;
  onRegenerate: (section: BriefSectionKey) => void;
}

/** Sebar timestamp adegan merata sesuai total durasi (R18). */
function reflowScenes(scenes: SceneDraft[], totalSec: number): SceneDraft[] {
  const count = Math.max(1, scenes.length);
  return scenes.map((scene, index) => ({
    ...scene,
    startSec: Math.round((index * totalSec) / count),
    endSec: Math.round(((index + 1) * totalSec) / count),
  }));
}

function baseLabel(label: string): string {
  return label.split(" · ")[0];
}

export function VideoPanel({
  data,
  busy,
  onPatch,
  onRegenerate,
}: VideoPanelProps) {
  const [mediaBusy, setMediaBusy] = useState<string | null>(null);
  const altRef = useRef(0);
  const idRef = useRef(100);

  const patchVideo = (
    section: BriefSectionKey,
    updater: (current: VideoDraft) => VideoDraft
  ) =>
    onPatch(section, (current) =>
      current.contentType === "video"
        ? { ...current, data: updater(current.data) }
        : current
    );

  const nextMediaLabel = (scene: SceneDraft) => {
    altRef.current += 1;
    return `${baseLabel(scene.media)} · alt ${altRef.current}`;
  };

  const replaceMedia = (sceneId: string) =>
    patchVideo("scenes", (current) => ({
      ...current,
      scenes: current.scenes.map((scene) =>
        scene.id === sceneId
          ? { ...scene, media: nextMediaLabel(scene) }
          : scene
      ),
    }));

  const regenerateMedia = (sceneId: string) => {
    if (mediaBusy) return;
    setMediaBusy(sceneId);
    window.setTimeout(() => {
      replaceMedia(sceneId);
      setMediaBusy(null);
    }, 700);
  };

  const setSceneTime = (
    sceneId: string,
    field: "startSec" | "endSec",
    value: number
  ) =>
    patchVideo("scenes", (current) => ({
      ...current,
      scenes: current.scenes.map((scene) =>
        scene.id === sceneId ? { ...scene, [field]: value } : scene
      ),
    }));

  const moveScene = (index: number, direction: -1 | 1) =>
    patchVideo("scenes", (current) => {
      const target = index + direction;
      if (target < 0 || target >= current.scenes.length) return current;
      const scenes = [...current.scenes];
      [scenes[index], scenes[target]] = [scenes[target], scenes[index]];
      return { ...current, scenes: reflowScenes(scenes, current.durationSec) };
    });

  const removeScene = (sceneId: string) =>
    patchVideo("scenes", (current) => {
      if (current.scenes.length <= 1) return current;
      return {
        ...current,
        scenes: reflowScenes(
          current.scenes.filter((scene) => scene.id !== sceneId),
          current.durationSec
        ),
      };
    });

  const addScene = () =>
    patchVideo("scenes", (current) => {
      idRef.current += 1;
      const scene: SceneDraft = {
        id: `scene-${idRef.current}`,
        startSec: 0,
        endSec: 0,
        media: `Mock render adegan ${current.scenes.length + 1}`,
        visualText: "",
      };
      return {
        ...current,
        scenes: reflowScenes([...current.scenes, scene], current.durationSec),
      };
    });

  const reflow = () =>
    patchVideo("scenes", (current) => ({
      ...current,
      scenes: reflowScenes(current.scenes, current.durationSec),
    }));

  // Validasi timestamp (R18): tidak tumpang tindih & sesuai total durasi.
  const timeError = (index: number, scene: SceneDraft): string | null => {
    const prev = index > 0 ? data.scenes[index - 1] : null;
    if (prev && scene.startSec < prev.endSec) {
      return "Tumpang tindih dengan adegan sebelumnya.";
    }
    if (scene.endSec <= scene.startSec) {
      return "Durasi adegan harus lebih dari 0 detik.";
    }
    if (scene.endSec > data.durationSec) {
      return `Melebihi total durasi video (${data.durationSec} detik).`;
    }
    return null;
  };

  const lastScene = data.scenes[data.scenes.length - 1];
  const coverageOk = !lastScene || lastScene.endSec === data.durationSec;
  const hasTimeError = data.scenes.some((scene, index) =>
    timeError(index, scene)
  );

  return (
    <div className="space-y-4">
      <BriefSectionCard
        title="Pengaturan umum"
        description="Durasi, aspect ratio, dan pilihan avatar (untuk video Full AI)."
        actions={
          <RegenerateButton
            busy={busy}
            onClick={() => onRegenerate("settings")}
          />
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="video-duration">Durasi</Label>
            <Select
              value={String(data.durationSec)}
              onValueChange={(value) =>
                patchVideo("settings", (current) => {
                  const durationSec = Number(value);
                  return {
                    ...current,
                    durationSec,
                    scenes: reflowScenes(current.scenes, durationSec),
                  };
                })
              }
              disabled={busy}
            >
              <SelectTrigger id="video-duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((seconds) => (
                  <SelectItem key={seconds} value={String(seconds)}>
                    {seconds} detik
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="video-aspect">Aspect ratio</Label>
            <Select
              value={data.aspectRatio}
              onValueChange={(value) =>
                patchVideo("settings", (current) => ({
                  ...current,
                  aspectRatio: value,
                }))
              }
              disabled={busy}
            >
              <SelectTrigger id="video-aspect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VIDEO_ASPECT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="video-avatar">Avatar</Label>
            <Select
              value={data.avatar}
              onValueChange={(value) =>
                patchVideo("settings", (current) => ({
                  ...current,
                  avatar: value,
                }))
              }
              disabled={busy}
            >
              <SelectTrigger id="video-avatar">
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
        title="Ringkasan konten"
        description="Summary yang bisa diedit sebelum masuk produksi."
        actions={
          <RegenerateButton busy={busy} onClick={() => onRegenerate("summary")} />
        }
      >
        <Label htmlFor="video-summary" className="sr-only">
          Ringkasan konten
        </Label>
        <Textarea
          id="video-summary"
          value={data.summary}
          rows={3}
          disabled={busy}
          onChange={(event) =>
            patchVideo("summary", (current) => ({
              ...current,
              summary: event.target.value,
            }))
          }
          className="resize-y"
        />
      </BriefSectionCard>

      <BriefSectionCard
        title={`Daftar adegan (${data.scenes.length})`}
        description="Timestamp tervalidasi — tidak tumpang tindih dan sesuai total durasi. Urutkan lewat tombol panah."
        actions={
          <RegenerateButton busy={busy} onClick={() => onRegenerate("scenes")} />
        }
      >
        {!coverageOk && !hasTimeError && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            <span className="inline-flex items-center gap-1.5">
              <TriangleAlert className="size-3.5" aria-hidden />
              Total adegan ({lastScene?.endSec ?? 0} detik) belum mencapai
              durasi video ({data.durationSec} detik).
            </span>
            <Button type="button" size="sm" variant="outline" onClick={reflow}>
              Rapikan timestamp
            </Button>
          </div>
        )}

        <ul className="space-y-3">
          {data.scenes.map((scene, index) => {
            const error = timeError(index, scene);
            return (
              <li
                key={scene.id}
                className="rounded-lg border border-border bg-background p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      Adegan {index + 1}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Label
                        htmlFor={`${scene.id}-start`}
                        className="sr-only"
                      >
                        Detik mulai adegan {index + 1}
                      </Label>
                      <Input
                        id={`${scene.id}-start`}
                        type="number"
                        min={0}
                        value={scene.startSec}
                        disabled={busy}
                        onChange={(event) =>
                          setSceneTime(
                            scene.id,
                            "startSec",
                            Number(event.target.value)
                          )
                        }
                        className="h-7 w-16 text-xs tabular-nums"
                      />
                      <span className="text-muted-foreground">–</span>
                      <Label htmlFor={`${scene.id}-end`} className="sr-only">
                        Detik akhir adegan {index + 1}
                      </Label>
                      <Input
                        id={`${scene.id}-end`}
                        type="number"
                        min={0}
                        value={scene.endSec}
                        disabled={busy}
                        onChange={(event) =>
                          setSceneTime(
                            scene.id,
                            "endSec",
                            Number(event.target.value)
                          )
                        }
                        className="h-7 w-16 text-xs tabular-nums"
                      />
                      <span className="text-xs text-muted-foreground">
                        detik
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Naikkan adegan ${index + 1}`}
                      disabled={busy || index === 0}
                      onClick={() => moveScene(index, -1)}
                    >
                      <ChevronUp className="size-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Turunkan adegan ${index + 1}`}
                      disabled={busy || index === data.scenes.length - 1}
                      onClick={() => moveScene(index, 1)}
                    >
                      <ChevronDown className="size-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Hapus adegan ${index + 1}`}
                      disabled={busy || data.scenes.length <= 1}
                      onClick={() => removeScene(scene.id)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                </div>

                {error && (
                  <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-destructive">
                    <TriangleAlert className="size-3.5" aria-hidden />
                    {error}
                  </p>
                )}

                <div className="mt-3 grid gap-3 sm:grid-cols-[220px_1fr]">
                  <MediaPreview
                    label={scene.media}
                    ariaLabel={`Media render adegan ${index + 1}`}
                    busy={mediaBusy === scene.id}
                    onReplace={() => replaceMedia(scene.id)}
                    onRegenerate={() => regenerateMedia(scene.id)}
                  />
                  <div className="space-y-1.5">
                    <Label htmlFor={`${scene.id}-text`}>
                      Teks visual / skrip adegan
                    </Label>
                    <Textarea
                      id={`${scene.id}-text`}
                      value={scene.visualText}
                      rows={3}
                      disabled={busy}
                      placeholder="Deskripsi apa yang tampil di layar…"
                      onChange={(event) =>
                        patchVideo("scenes", (current) => ({
                          ...current,
                          scenes: current.scenes.map((row) =>
                            row.id === scene.id
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
            );
          })}
        </ul>

        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-3"
          disabled={busy}
          onClick={addScene}
        >
          <Plus className="size-4" aria-hidden /> Tambah adegan
        </Button>
      </BriefSectionCard>
    </div>
  );
}
