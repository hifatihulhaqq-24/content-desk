"use client";

import { useMemo, type ReactNode } from "react";
import { Hash, Link2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { contentTypeLabel } from "@/config/content-types";
import { AVATAR_OPTIONS } from "@/config/brief-options";
import { hostOf } from "@/features/create/link-utils";
import { cn } from "@/lib/utils";
import type {
  ArticleDraft,
  BriefData,
  BriefSectionKey,
  CarouselDraft,
  CreativeDirection,
  Hashtags,
  ImageBrief,
  ImageDraft,
  SceneBrief,
  SceneDraft,
  SceneRole,
  SlideBrief,
  SlideDraft,
  SlideRole,
  VideoDraft,
} from "@/types/ideation";
import type { BriefController } from "@/hooks/use-brief";
import { BriefSection } from "./brief-section";
import { BriefVisual } from "./brief-visual";
import type { TocItem } from "./brief-toc";

interface BriefCanvasProps {
  draft: BriefData;
  brief: BriefController;
  topic: string;
  angle: string | null;
  scenario: string | null;
  imageCount: number;
  links: string[];
  className?: string;
}

/** Label peran adegan/slide — dipakai badge di kartu. */
const SCENE_ROLE_LABEL: Record<SceneRole, string> = {
  hook: "Hook",
  isi: "Isi",
  cta: "CTA",
};

const SLIDE_ROLE_LABEL: Record<SlideRole, string> = {
  hook: "Hook",
  masalah: "Masalah",
  data: "Data",
  tips: "Tips",
  bukti: "Bukti",
  cta: "CTA",
};

/** Warna badge per peran. */
const ROLE_BADGE: Record<string, string> = {
  hook: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  isi: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  cta: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  masalah: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  data: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  tips: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  bukti: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

/** Urutan + label field brief visual per tipe. */
const SCENE_BRIEF_ORDER: { key: keyof SceneBrief; label: string }[] = [
  { key: "shotAngle", label: "Sudut & ukuran kamera" },
  { key: "cameraMotion", label: "Gerak kamera" },
  { key: "setting", label: "Lokasi / latar" },
  { key: "ambient", label: "Suasana & waktu" },
  { key: "subject", label: "Karakter / objek" },
  { key: "lighting", label: "Pencahayaan" },
  { key: "palette", label: "Palet warna" },
  { key: "onScreenText", label: "Teks di layar" },
  { key: "audio", label: "Audio (VO / musik / SFX)" },
  { key: "transition", label: "Transisi keluar" },
];

const SLIDE_BRIEF_ORDER: { key: keyof SlideBrief; label: string }[] = [
  { key: "layout", label: "Tata letak" },
  { key: "composition", label: "Komposisi" },
  { key: "background", label: "Latar" },
  { key: "imagery", label: "Jenis imagery" },
  { key: "subject", label: "Subjek / objek" },
  { key: "typography", label: "Tipografi" },
  { key: "palette", label: "Palet warna" },
  { key: "overlay", label: "Elemen overlay" },
  { key: "transition", label: "Transisi" },
];

const IMAGE_BRIEF_ORDER: { key: keyof ImageBrief; label: string }[] = [
  { key: "composition", label: "Komposisi" },
  { key: "subject", label: "Subjek" },
  { key: "background", label: "Latar" },
  { key: "lighting", label: "Pencahayaan" },
  { key: "palette", label: "Palet warna" },
  { key: "typography", label: "Tipografi" },
  { key: "negativeSpace", label: "Ruang kosong / safe area" },
];

const CREATIVE_ORDER: { key: keyof CreativeDirection; label: string; hint: string }[] = [
  {
    key: "targetPembaca",
    label: "Target pembaca",
    hint: "Siapa yang membaca/menonton — usia, kondisi, kebutuhan.",
  },
  {
    key: "toneOfVoice",
    label: "Tone of voice",
    hint: "Nada komunikasi: formal, santai, tegas, mengajak.",
  },
  {
    key: "keyMessage",
    label: "Key message",
    hint: "Satu pesan utama yang harus melekat di kepala audiens.",
  },
  {
    key: "callToAction",
    label: "Call to action",
    hint: "Apa yang diharapkan audiens lakukan setelah selesai.",
  },
];

/* ---------- Util konten ---------- */

/** Render teks polos dengan newline → baris terpisah. */
function MultilineText({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return <p className={cn("text-sm text-muted-foreground", className)}>—</p>;
  }
  return (
    <div className={cn("space-y-1.5", className)}>
      {lines.map((line, index) => (
        <p key={index} className="text-sm leading-relaxed">
          {line}
        </p>
      ))}
    </div>
  );
}

/** Daftar item untuk panel navigasi kanan — urutannya sama dengan canvas. */
export function tocItemsForDraft(draft: BriefData): TocItem[] {
  const common: TocItem = {
    id: "sec-identitas",
    label: "Identitas brief",
    meta: contentTypeLabel(draft.contentType),
  };
  const creative: TocItem = { id: "sec-creative", label: "Arah kreatif" };
  const hashtags: TocItem = {
    id: "sec-hashtags",
    label: "Hashtags",
    meta: `${draft.data.hashtags.length}`,
  };
  const render: TocItem = { id: "sec-render", label: "Pratinjau render" };

  switch (draft.contentType) {
    case "article":
      return [
        common,
        creative,
        { id: "sec-headline", label: "Judul" },
        { id: "sec-caption", label: "Caption" },
        { id: "sec-outline", label: "Outline", meta: `${draft.data.outline.length}` },
        { id: "sec-body", label: "Isi artikel" },
        hashtags,
        render,
      ];
    case "video":
      return [
        common,
        creative,
        { id: "sec-settings", label: "Pengaturan" },
        { id: "sec-summary", label: "Ringkasan" },
        { id: "sec-caption", label: "Caption" },
        { id: "sec-scenes", label: "Adegan", meta: `${draft.data.scenes.length}` },
        hashtags,
        render,
      ];
    case "image":
      return [
        common,
        creative,
        { id: "sec-settings", label: "Pengaturan" },
        { id: "sec-visualbrief", label: "Visual brief" },
        { id: "sec-visualtext", label: "Teks visual" },
        { id: "sec-caption", label: "Caption" },
        hashtags,
        render,
      ];
    case "carousel":
      return [
        common,
        creative,
        { id: "sec-settings", label: "Pengaturan" },
        { id: "sec-summary", label: "Ringkasan" },
        { id: "sec-caption", label: "Caption" },
        { id: "sec-slides", label: "Slide", meta: `${draft.data.slides.length}` },
        hashtags,
        render,
      ];
  }
}

/* ---------- Field kecil ---------- */

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Textarea yang commit nilai saat kehilangan fokus. */
function TextAreaField({
  id,
  label,
  hint,
  value,
  rows = 2,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <Field id={id} label={label} hint={hint}>
      <Textarea
        id={id}
        rows={rows}
        defaultValue={value}
        onBlur={(event) => onChange(event.target.value)}
        className="resize-y"
      />
    </Field>
  );
}

/** Pasangan label–nilai dalam grid (dipakai untuk semua brief visual). */
function FactsView({
  items,
  className,
}: {
  items: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-2 sm:grid-cols-2", className)}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-0.5 text-sm leading-relaxed">{item.value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Identitas brief — sama untuk semua tipe konten. */
function IdentitasSection({
  topic,
  angle,
  scenario,
  imageCount,
  links,
  contentType,
}: {
  topic: string;
  angle: string | null;
  scenario: string | null;
  imageCount: number;
  links: string[];
  contentType: BriefData["contentType"];
}) {
  const rows: { label: string; value: string }[] = [
    { label: "Topik", value: topic },
    { label: "Angle", value: angle ?? "—" },
    { label: "Format", value: contentTypeLabel(contentType) },
    { label: "Skenario", value: scenario === "custom" ? "Topik sendiri" : "Rekomendasi" },
  ];

  return (
    <BriefSection
      id="sec-identitas"
      title="Identitas brief"
      description="Ringkasan konteks pembuatan draf."
    >
      <FactsView items={rows} />

      {(imageCount > 0 || links.length > 0) && (
        <div className="mt-3 space-y-1.5 border-t border-border pt-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Aset &amp; referensi
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {imageCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="size-3" aria-hidden />
                {imageCount} gambar
              </Badge>
            )}
            {links.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-56 items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Link2 className="size-3 shrink-0" aria-hidden />
                <span className="truncate">{hostOf(url)}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </BriefSection>
  );
}

/** Arah kreatif — rujukan utama, tampil di semua tipe konten. */
function CreativeDirectionSection({
  value,
  busy,
  onRegenerate,
  onPatch,
}: {
  value: CreativeDirection;
  busy?: boolean;
  onRegenerate?: (section: BriefSectionKey) => void;
  onPatch: (updater: (d: CreativeDirection) => CreativeDirection) => void;
}) {
  return (
    <BriefSection
      id="sec-creative"
      sectionKey="creative"
      title="Arah kreatif"
      description="Rujukan utama sebelum masuk ke detail tiap aspek."
      busy={busy}
      onRegenerate={onRegenerate}
      editContent={
        <div className="grid gap-3 sm:grid-cols-2">
          {CREATIVE_ORDER.map((field) => (
            <TextAreaField
              key={field.key}
              id={`creative-${field.key}`}
              label={field.label}
              hint={field.hint}
              rows={3}
              value={value[field.key]}
              onChange={(text) =>
                onPatch((current) => ({ ...current, [field.key]: text }))
              }
            />
          ))}
        </div>
      }
    >
      <FactsView
        items={CREATIVE_ORDER.map((field) => ({
          label: field.label,
          value: value[field.key],
        }))}
      />
    </BriefSection>
  );
}

/* ---------- Hashtags ---------- */

function parseHashtags(value: string): Hashtags {
  return value
    .split(/[,\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
}

function HashtagsSection({
  hashtags,
  onPatch,
  onRegenerate,
  busy,
}: {
  hashtags: Hashtags;
  onPatch: (updater: (tags: Hashtags) => Hashtags) => void;
  onRegenerate?: (section: BriefSectionKey) => void;
  busy?: boolean;
}) {
  return (
    <BriefSection
      id="sec-hashtags"
      title="Suggestion hashtags"
      description="Rekomendasi tag untuk distribusi — bisa disunting."
      sectionKey="hashtags"
      busy={busy}
      onRegenerate={onRegenerate}
      editContent={
        <TextAreaField
          id="hashtags-input"
          label="Hashtags"
          hint="Pisahkan dengan koma atau spasi. Contoh: #TopikHariIni #FaktaKunci"
          rows={3}
          value={hashtags.join(", ")}
          onChange={(text) => onPatch(() => parseHashtags(text))}
        />
      }
    >
      <div className="flex flex-wrap gap-1.5">
        {hashtags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_oklab,var(--chart-content)_25%,transparent)] bg-[color-mix(in_oklab,var(--chart-content)_8%,transparent)] px-2.5 py-1 text-xs font-medium text-[var(--chart-content)] dark:text-chart-3"
          >
            <Hash className="size-3" aria-hidden />
            {tag.replace(/^#/, "")}
          </span>
        ))}
      </div>
    </BriefSection>
  );
}

/**
 * Pratinjau mock render — sengaja diletakkan paling bawah dan berukuran kecil.
 * Fase brief berfokus pada teks; gambar hanya indikator.
 */
function RenderPreviewSection({
  items,
  narrow,
  note,
}: {
  items: { seedKey: string; badge?: string }[];
  /** true = thumbnail tunggal berukuran kecil (image/artikel). */
  narrow?: boolean;
  note?: string;
}) {
  return (
    <BriefSection
      id="sec-render"
      title="Pratinjau render (mock)"
      description="Indikasi visual kecil — isi brief yang utama ada di teks di atas."
    >
      <div
        className={cn(
          "grid gap-2",
          narrow ? "max-w-[240px]" : "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6"
        )}
      >
        {items.map((item) => (
          <BriefVisual key={item.seedKey} seedKey={item.seedKey} compact badge={item.badge} />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {note ?? "Gambar mock untuk indikasi — generator media asli di luar scope."}
      </p>
    </BriefSection>
  );
}

/* ---------- Kartu adegan / slide ---------- */

function RoleBadge({ label, role }: { label: string; role: SceneRole | SlideRole }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
        ROLE_BADGE[role] ?? "bg-muted text-muted-foreground"
      )}
    >
      {label}
    </span>
  );
}

/** Editor satu adegan video: teks + narasi + seluruh brief visual. */
function SceneEditor({
  scene,
  index,
  onPatch,
}: {
  scene: SceneDraft;
  index: number;
  onPatch: (index: number, updater: (s: SceneDraft) => SceneDraft) => void;
}) {
  const patchBrief = (key: keyof SceneBrief, value: string) =>
    onPatch(index, (s) => ({ ...s, visualBrief: { ...s.visualBrief, [key]: value } }));

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold">Adegan {index + 1}</span>
        <RoleBadge label={SCENE_ROLE_LABEL[scene.role]} role={scene.role} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <TextAreaField
          id={`scene-text-${index}`}
          label="Teks visual / subtitle"
          value={scene.visualText}
          onChange={(text) => onPatch(index, (s) => ({ ...s, visualText: text }))}
        />
        <TextAreaField
          id={`scene-narration-${index}`}
          label="Narasi / voice-over"
          value={scene.narration}
          onChange={(text) => onPatch(index, (s) => ({ ...s, narration: text }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field id={`scene-start-${index}`} label="Mulai (detik)">
          <Input
            id={`scene-start-${index}`}
            type="number"
            min={0}
            defaultValue={scene.startSec}
            onBlur={(event) =>
              onPatch(index, (s) => ({ ...s, startSec: Number(event.target.value) }))
            }
          />
        </Field>
        <Field id={`scene-end-${index}`} label="Selesai (detik)">
          <Input
            id={`scene-end-${index}`}
            type="number"
            min={1}
            defaultValue={scene.endSec}
            onBlur={(event) =>
              onPatch(index, (s) => ({ ...s, endSec: Number(event.target.value) }))
            }
          />
        </Field>
      </div>

      <div className="border-t border-border pt-3">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Visual brief adegan
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {SCENE_BRIEF_ORDER.map((field) => (
            <TextAreaField
              key={field.key}
              id={`scene-brief-${index}-${field.key}`}
              label={field.label}
              value={scene.visualBrief[field.key]}
              onChange={(text) => patchBrief(field.key, text)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Tampilan satu adegan video. */
function SceneCard({
  scene,
  index,
}: {
  scene: SceneDraft;
  index: number;
}) {
  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
          Adegan {index + 1}
        </span>
        <RoleBadge label={SCENE_ROLE_LABEL[scene.role]} role={scene.role} />
        <span className="text-xs tabular-nums text-muted-foreground">
          {scene.startSec}s – {scene.endSec}s
        </span>
      </div>

      <p className="mt-2 text-sm font-medium">{scene.visualText}</p>
      <p className="mt-1 text-sm italic leading-relaxed text-muted-foreground">
        {scene.narration}
      </p>

      <div className="mt-3 border-t border-border pt-3">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Visual brief
        </p>
        <FactsView
          items={SCENE_BRIEF_ORDER.map((field) => ({
            label: field.label,
            value: scene.visualBrief[field.key],
          }))}
        />
      </div>
    </li>
  );
}

/** Editor satu slide carousel. */
function SlideEditor({
  slide,
  index,
  onPatch,
}: {
  slide: SlideDraft;
  index: number;
  onPatch: (index: number, updater: (s: SlideDraft) => SlideDraft) => void;
}) {
  const patchBrief = (key: keyof SlideBrief, value: string) =>
    onPatch(index, (s) => ({ ...s, visualBrief: { ...s.visualBrief, [key]: value } }));

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold">Slide {index + 1}</span>
        <RoleBadge label={SLIDE_ROLE_LABEL[slide.role]} role={slide.role} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <TextAreaField
          id={`slide-headline-${index}`}
          label="Judul slide"
          value={slide.headline}
          onChange={(text) => onPatch(index, (s) => ({ ...s, headline: text }))}
        />
        <TextAreaField
          id={`slide-visual-${index}`}
          label="Teks visual"
          value={slide.visualText}
          onChange={(text) => onPatch(index, (s) => ({ ...s, visualText: text }))}
        />
      </div>

      <TextAreaField
        id={`slide-body-${index}`}
        label="Body copy"
        rows={3}
        value={slide.bodyText}
        onChange={(text) => onPatch(index, (s) => ({ ...s, bodyText: text }))}
      />

      <div className="border-t border-border pt-3">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Visual brief slide
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {SLIDE_BRIEF_ORDER.map((field) => (
            <TextAreaField
              key={field.key}
              id={`slide-brief-${index}-${field.key}`}
              label={field.label}
              value={slide.visualBrief[field.key]}
              onChange={(text) => patchBrief(field.key, text)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Tampilan satu slide carousel. */
function SlideCard({ slide, index }: { slide: SlideDraft; index: number }) {
  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
          Slide {index + 1}
        </span>
        <RoleBadge label={SLIDE_ROLE_LABEL[slide.role]} role={slide.role} />
      </div>

      <p className="mt-2 text-sm font-semibold">{slide.headline}</p>
      <p className="mt-1 text-sm leading-relaxed">{slide.bodyText}</p>
      <p className="mt-1.5 text-xs text-muted-foreground">{slide.visualText}</p>

      <div className="mt-3 border-t border-border pt-3">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Visual brief
        </p>
        <FactsView
          items={SLIDE_BRIEF_ORDER.map((field) => ({
            label: field.label,
            value: slide.visualBrief[field.key],
          }))}
        />
      </div>
    </li>
  );
}

/* ---------- Canvas utama ---------- */

export function BriefCanvas({
  draft,
  brief,
  topic,
  angle,
  scenario,
  imageCount,
  links,
  className,
}: BriefCanvasProps) {
  const busy = brief.status === "generating";
  const regen = brief.regenerateSection;

  const identitas = useMemo(
    () => (
      <IdentitasSection
        topic={topic}
        angle={angle}
        scenario={scenario}
        imageCount={imageCount}
        links={links}
        contentType={draft.contentType}
      />
    ),
    [topic, angle, scenario, imageCount, links, draft.contentType]
  );

  /* ----- Article ----- */
  if (draft.contentType === "article") {
    const data: ArticleDraft = draft.data;
    const patch = (updater: (d: ArticleDraft) => ArticleDraft, section: BriefSectionKey) =>
      brief.patch(section, (current) =>
        current.contentType === "article"
          ? { ...current, data: updater(current.data) }
          : current
      );

    return (
      <div className={cn("space-y-4", className)}>
        {identitas}

        <CreativeDirectionSection
          value={data.creativeDirection}
          busy={busy}
          onRegenerate={regen}
          onPatch={(updater) =>
            patch((d) => ({ ...d, creativeDirection: updater(d.creativeDirection) }), "creative")
          }
        />

        <BriefSection
          id="sec-headline"
          sectionKey="headline"
          title="Judul"
          description="Judul utama draf."
          busy={busy}
          onRegenerate={regen}
          editContent={
            <TextAreaField
              id="headline-input"
              label="Judul"
              rows={2}
              value={data.headline}
              onChange={(text) =>
                patch((d) => ({ ...d, headline: text }), "headline")
              }
            />
          }
        >
          <h4 className="text-lg font-bold leading-snug">{data.headline}</h4>
        </BriefSection>

        <BriefSection
          id="sec-caption"
          sectionKey="caption"
          title="Caption"
          description="Caption pendek untuk promosi."
          busy={busy}
          onRegenerate={regen}
          editContent={
            <TextAreaField
              id="caption-input"
              label="Caption"
              rows={3}
              value={data.caption}
              onChange={(text) =>
                patch((d) => ({ ...d, caption: text }), "caption")
              }
            />
          }
        >
          <MultilineText text={data.caption} />
        </BriefSection>

        <BriefSection
          id="sec-outline"
          sectionKey="outline"
          title="Outline / subjudul"
          description="Struktur bagian artikel — satu subjudul per baris."
          busy={busy}
          onRegenerate={regen}
          editContent={
            <TextAreaField
              id="outline-input"
              label="Outline"
              hint="Satu subjudul per baris."
              rows={7}
              value={data.outline.join("\n")}
              onChange={(text) =>
                patch(
                  (d) => ({
                    ...d,
                    outline: text
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean),
                  }),
                  "outline"
                )
              }
            />
          }
        >
          <ol className="space-y-1.5">
            {data.outline.map((item, index) => (
              <li key={index} className="flex gap-2 text-sm">
                <span className="w-5 shrink-0 tabular-nums text-muted-foreground">
                  {index + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </BriefSection>

        <BriefSection
          id="sec-body"
          sectionKey="body"
          title="Isi artikel"
          description="Draf isi — edit langsung pada mode edit."
          busy={busy}
          onRegenerate={regen}
          editContent={
            <RichTextEditor
              value={data.body}
              aria-label="Isi artikel"
              onChange={(html) =>
                patch((d) => ({ ...d, body: html }), "body")
              }
            />
          }
        >
          <div
            className="brief-prose text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: data.body }}
          />
        </BriefSection>

        <HashtagsSection
          hashtags={data.hashtags}
          busy={busy}
          onRegenerate={regen}
          onPatch={(updater) =>
            patch((d) => ({ ...d, hashtags: updater(d.hashtags) }), "hashtags")
          }
        />

        <RenderPreviewSection
          narrow
          items={[{ seedKey: `${topic}-hero`, badge: "Hero 16:9" }]}
        />
      </div>
    );
  }

  /* ----- Video ----- */
  if (draft.contentType === "video") {
    const data: VideoDraft = draft.data;
    const patch = (updater: (d: VideoDraft) => VideoDraft, section: BriefSectionKey) =>
      brief.patch(section, (current) =>
        current.contentType === "video"
          ? { ...current, data: updater(current.data) }
          : current
      );
    const patchScene = (index: number, updater: (s: SceneDraft) => SceneDraft) =>
      patch(
        (d) => ({
          ...d,
          scenes: d.scenes.map((scene, i) => (i === index ? updater(scene) : scene)),
        }),
        "scenes"
      );

    return (
      <div className={cn("space-y-4", className)}>
        {identitas}

        <CreativeDirectionSection
          value={data.creativeDirection}
          busy={busy}
          onRegenerate={regen}
          onPatch={(updater) =>
            patch((d) => ({ ...d, creativeDirection: updater(d.creativeDirection) }), "creative")
          }
        />

        <BriefSection
          id="sec-settings"
          sectionKey="settings"
          title="Pengaturan umum"
          description="Durasi, aspect ratio, dan avatar presenter."
          busy={busy}
          onRegenerate={regen}
          editContent={
            <div className="grid gap-3 sm:grid-cols-3">
              <Field id="video-aspect" label="Aspect ratio">
                <Select
                  value={data.aspectRatio}
                  onValueChange={(value) =>
                    patch((d) => ({ ...d, aspectRatio: value }), "settings")
                  }
                >
                  <SelectTrigger id="video-aspect" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["9:16", "1:1", "16:9"].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field id="video-duration" label="Durasi (detik)">
                <Select
                  value={String(data.durationSec)}
                  onValueChange={(value) =>
                    patch((d) => ({ ...d, durationSec: Number(value) }), "settings")
                  }
                >
                  <SelectTrigger id="video-duration" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[30, 45, 60].map((value) => (
                      <SelectItem key={value} value={String(value)}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field id="video-avatar" label="Avatar">
                <Select
                  value={data.avatar}
                  onValueChange={(value) =>
                    patch((d) => ({ ...d, avatar: value }), "settings")
                  }
                >
                  <SelectTrigger id="video-avatar" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVATAR_OPTIONS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          }
        >
          <FactsView
            items={[
              { label: "Durasi", value: `${data.durationSec} detik` },
              { label: "Aspect ratio", value: data.aspectRatio },
              { label: "Avatar", value: data.avatar },
            ]}
          />
        </BriefSection>

        <BriefSection
          id="sec-summary"
          sectionKey="summary"
          title="Ringkasan konten"
          description="Alur video dalam satu paragraf."
          busy={busy}
          onRegenerate={regen}
          editContent={
            <TextAreaField
              id="summary-input"
              label="Ringkasan"
              rows={5}
              value={data.summary}
              onChange={(text) =>
                patch((d) => ({ ...d, summary: text }), "summary")
              }
            />
          }
        >
          <MultilineText text={data.summary} />
        </BriefSection>

        <BriefSection
          id="sec-caption"
          sectionKey="caption"
          title="Caption"
          description="Deskripsi untuk unggahan video."
          busy={busy}
          onRegenerate={regen}
          editContent={
            <TextAreaField
              id="video-caption"
              label="Caption"
              rows={3}
              value={data.caption}
              onChange={(text) =>
                patch((d) => ({ ...d, caption: text }), "caption")
              }
            />
          }
        >
          <MultilineText text={data.caption} />
        </BriefSection>

        <BriefSection
          id="sec-scenes"
          sectionKey="scenes"
          title={`Daftar adegan (${data.scenes.length})`}
          description="Teks, narasi, dan visual brief teknis untuk tiap adegan."
          busy={busy}
          onRegenerate={regen}
          editContent={
            <div className="space-y-4">
              {data.scenes.map((scene, index) => (
                <SceneEditor key={scene.id} scene={scene} index={index} onPatch={patchScene} />
              ))}
            </div>
          }
        >
          <ol className="space-y-3">
            {data.scenes.map((scene, index) => (
              <SceneCard key={scene.id} scene={scene} index={index} />
            ))}
          </ol>
        </BriefSection>

        <HashtagsSection
          hashtags={data.hashtags}
          busy={busy}
          onRegenerate={regen}
          onPatch={(updater) =>
            patch((d) => ({ ...d, hashtags: updater(d.hashtags) }), "hashtags")
          }
        />

        <RenderPreviewSection
          items={data.scenes.map((scene, index) => ({
            seedKey: `${topic}-scene-${index}`,
            badge: `${index + 1}`,
          }))}
        />
      </div>
    );
  }

  /* ----- Image ----- */
  if (draft.contentType === "image") {
    const data: ImageDraft = draft.data;
    const patch = (updater: (d: ImageDraft) => ImageDraft, section: BriefSectionKey) =>
      brief.patch(section, (current) =>
        current.contentType === "image"
          ? { ...current, data: updater(current.data) }
          : current
      );

    return (
      <div className={cn("space-y-4", className)}>
        {identitas}

        <CreativeDirectionSection
          value={data.creativeDirection}
          busy={busy}
          onRegenerate={regen}
          onPatch={(updater) =>
            patch((d) => ({ ...d, creativeDirection: updater(d.creativeDirection) }), "creative")
          }
        />

        <BriefSection
          id="sec-settings"
          sectionKey="settings"
          title="Pengaturan umum"
          description="Aspect ratio dan avatar."
          busy={busy}
          onRegenerate={regen}
          editContent={
            <div className="grid gap-3 sm:grid-cols-2">
              <Field id="image-aspect" label="Aspect ratio">
                <Select
                  value={data.aspectRatio}
                  onValueChange={(value) =>
                    patch((d) => ({ ...d, aspectRatio: value }), "settings")
                  }
                >
                  <SelectTrigger id="image-aspect" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["1:1", "4:5", "16:9"].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field id="image-avatar" label="Avatar">
                <Select
                  value={data.avatar}
                  onValueChange={(value) =>
                    patch((d) => ({ ...d, avatar: value }), "settings")
                  }
                >
                  <SelectTrigger id="image-avatar" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVATAR_OPTIONS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          }
        >
          <FactsView
            items={[
              { label: "Aspect ratio", value: data.aspectRatio },
              { label: "Avatar", value: data.avatar },
            ]}
          />
        </BriefSection>

        <BriefSection
          id="sec-visualbrief"
          sectionKey="visual"
          title="Visual brief"
          description="Deskripsi teknis gambar — komposisi, subjek, latar, tipografi."
          busy={busy}
          onRegenerate={regen}
          editContent={
            <div className="grid gap-3 sm:grid-cols-2">
              {IMAGE_BRIEF_ORDER.map((field) => (
                <TextAreaField
                  key={field.key}
                  id={`image-brief-${field.key}`}
                  label={field.label}
                  rows={3}
                  value={data.visualBrief[field.key]}
                  onChange={(text) =>
                    patch(
                      (d) => ({
                        ...d,
                        visualBrief: { ...d.visualBrief, [field.key]: text },
                      }),
                      "visual"
                    )
                  }
                />
              ))}
            </div>
          }
        >
          <FactsView
            items={IMAGE_BRIEF_ORDER.map((field) => ({
              label: field.label,
              value: data.visualBrief[field.key],
            }))}
          />
        </BriefSection>

        <BriefSection
          id="sec-visualtext"
          sectionKey="visual"
          title="Teks visual"
          description="Teks yang tampil di atas gambar."
          busy={busy}
          onRegenerate={regen}
          editContent={
            <TextAreaField
              id="visualtext-input"
              label="Teks visual"
              rows={3}
              value={data.visualText}
              onChange={(text) =>
                patch((d) => ({ ...d, visualText: text }), "visual")
              }
            />
          }
        >
          <MultilineText text={data.visualText} />
        </BriefSection>

        <BriefSection
          id="sec-caption"
          sectionKey="caption"
          title="Caption"
          description="Deskripsi untuk unggahan gambar."
          busy={busy}
          onRegenerate={regen}
          editContent={
            <TextAreaField
              id="image-caption"
              label="Caption"
              rows={3}
              value={data.caption}
              onChange={(text) =>
                patch((d) => ({ ...d, caption: text }), "caption")
              }
            />
          }
        >
          <MultilineText text={data.caption} />
        </BriefSection>

        <HashtagsSection
          hashtags={data.hashtags}
          busy={busy}
          onRegenerate={regen}
          onPatch={(updater) =>
            patch((d) => ({ ...d, hashtags: updater(d.hashtags) }), "hashtags")
          }
        />

        <RenderPreviewSection
          narrow
          items={[{ seedKey: `${topic}-image`, badge: data.aspectRatio }]}
        />
      </div>
    );
  }

  /* ----- Carousel — struktur identik dengan video ----- */
  const data: CarouselDraft = draft.data;
  const patch = (updater: (d: CarouselDraft) => CarouselDraft, section: BriefSectionKey) =>
    brief.patch(section, (current) =>
      current.contentType === "carousel"
        ? { ...current, data: updater(current.data) }
        : current
    );
  const patchSlide = (index: number, updater: (s: SlideDraft) => SlideDraft) =>
    patch(
      (d) => ({
        ...d,
        slides: d.slides.map((slide, i) => (i === index ? updater(slide) : slide)),
      }),
      "slides"
    );

  return (
    <div className={cn("space-y-4", className)}>
      {identitas}

      <CreativeDirectionSection
        value={data.creativeDirection}
        busy={busy}
        onRegenerate={regen}
        onPatch={(updater) =>
          patch((d) => ({ ...d, creativeDirection: updater(d.creativeDirection) }), "creative")
        }
      />

      <BriefSection
        id="sec-settings"
        sectionKey="settings"
        title="Pengaturan carousel"
        description="Jumlah slide dan aspect ratio."
        busy={busy}
        onRegenerate={regen}
        editContent={
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="carousel-count" label="Jumlah slide">
              <Select
                value={String(data.slideCount)}
                onValueChange={(value) => {
                  const count = Number(value);
                  patch((d) => {
                    // Pertahankan slide yang ada; slot baru disalin dari slide terakhir.
                    const base = d.slides[d.slides.length - 1];
                    const slides: SlideDraft[] = Array.from({ length: count }, (_, i) => {
                      const existing = d.slides[i];
                      if (existing) return existing;
                      if (!base) return d.slides[i];
                      return {
                        ...base,
                        id: `slide-${i + 1}`,
                        media: `Mock render slide ${i + 1}`,
                      };
                    });
                    return { ...d, slideCount: count, slides };
                  }, "settings");
                }}
              >
                <SelectTrigger id="carousel-count" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6, 7, 8].map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {value} slide
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="carousel-aspect" label="Aspect ratio">
              <Select
                value={data.aspectRatio}
                onValueChange={(value) =>
                  patch((d) => ({ ...d, aspectRatio: value }), "settings")
                }
              >
                <SelectTrigger id="carousel-aspect" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["4:5", "1:1"].map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        }
      >
        <FactsView
          items={[
            { label: "Jumlah slide", value: `${data.slideCount} slide` },
            { label: "Aspect ratio", value: data.aspectRatio },
          ]}
        />
      </BriefSection>

      <BriefSection
        id="sec-summary"
        sectionKey="summary"
        title="Ringkasan konten"
        description="Alur carousel dalam satu paragraf."
        busy={busy}
        onRegenerate={regen}
        editContent={
          <TextAreaField
            id="carousel-summary"
            label="Ringkasan"
            rows={5}
            value={data.summary}
            onChange={(text) =>
              patch((d) => ({ ...d, summary: text }), "summary")
            }
          />
        }
      >
        <MultilineText text={data.summary} />
      </BriefSection>

      <BriefSection
        id="sec-caption"
        sectionKey="caption"
        title="Caption"
        description="Deskripsi untuk unggahan carousel."
        busy={busy}
        onRegenerate={regen}
        editContent={
          <TextAreaField
            id="carousel-caption"
            label="Caption"
            rows={3}
            value={data.caption}
            onChange={(text) =>
              patch((d) => ({ ...d, caption: text }), "caption")
            }
          />
        }
      >
        <MultilineText text={data.caption} />
      </BriefSection>

      <BriefSection
        id="sec-slides"
        sectionKey="slides"
        title={`Daftar slide (${data.slides.length})`}
        description="Teks, peran, dan visual brief teknis untuk tiap slide."
        busy={busy}
        onRegenerate={regen}
        editContent={
          <div className="space-y-4">
            {data.slides.map((slide, index) => (
              <SlideEditor key={slide.id} slide={slide} index={index} onPatch={patchSlide} />
            ))}
          </div>
        }
      >
        <ol className="space-y-3">
          {data.slides.map((slide, index) => (
            <SlideCard key={slide.id} slide={slide} index={index} />
          ))}
        </ol>
      </BriefSection>

      <HashtagsSection
        hashtags={data.hashtags}
        busy={busy}
        onRegenerate={regen}
        onPatch={(updater) =>
          patch((d) => ({ ...d, hashtags: updater(d.hashtags) }), "hashtags")
        }
      />

      <RenderPreviewSection
        items={data.slides.map((slide, index) => ({
          seedKey: `${topic}-slide-${index}`,
          badge: `${index + 1}`,
        }))}
      />
    </div>
  );
}
