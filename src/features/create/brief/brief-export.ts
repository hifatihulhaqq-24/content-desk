import type { BriefData } from "@/types/ideation";
import { contentTypeLabel } from "@/config/content-types";

export interface BriefMeta {
  topic: string;
  angle: string | null;
  scenario: string | null;
  imageCount: number;
  links: string[];
  savedAt: string | null;
}

/** Payload tersimpan di localStorage — draf + meta pendukung. */
export interface SavedBrief {
  meta: BriefMeta;
  draft: BriefData;
}

const STORAGE_KEY = "contentdesk.brief";

export function loadSavedBrief(): SavedBrief | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedBrief;
    if (!parsed?.draft?.contentType || !parsed?.meta) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveBrief(payload: SavedBrief): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

/** Ubah HTML rich text jadi teks polos untuk ekspor markdown. */
function htmlToText(html: string): string {
  return (
    html
      // Kutipan ditangani lebih dulu supaya awalan ">" tidak ikut terhapus.
      .replace(/<blockquote[^>]*>\s*<p[^>]*>/gi, "> ")
      .replace(/<\/p>\s*<\/blockquote>/gi, "\n")
      .replace(/<\/h2>/gi, "\n\n")
      .replace(/<h2[^>]*>/gi, "## ")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<li[^>]*>/gi, "- ")
      .replace(/<\/li>/gi, "\n")
      .replace(/<\/?(?:ul|ol|blockquote)[^>]*>/gi, "")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/** Format pasangan label–value jadi butir Markdown. */
function facts(items: { label: string; value: string }[], nested = false): string[] {
  const pad = nested ? "  " : "";
  return items
    .filter((item) => item.value)
    .map((item) => `${pad}- **${item.label}:** ${item.value}`);
}

interface SceneLike {
  startSec: number;
  endSec: number;
  role?: string;
  visualText?: string;
  narration?: string;
  visualBrief?: Record<string, string>;
}

interface SlideLike {
  role?: string;
  headline?: string;
  bodyText?: string;
  visualText?: string;
  visualBrief?: Record<string, string>;
}

/** Label field brief visual per tipe — dipakai ekspor Markdown. */
const SCENE_BRIEF_LABELS: Record<string, string> = {
  shotAngle: "Sudut & ukuran kamera",
  cameraMotion: "Gerak kamera",
  setting: "Lokasi / latar",
  ambient: "Suasana & waktu",
  subject: "Karakter / objek",
  lighting: "Pencahayaan",
  palette: "Palet warna",
  onScreenText: "Teks di layar",
  audio: "Audio",
  transition: "Transisi keluar",
};

const SLIDE_BRIEF_LABELS: Record<string, string> = {
  layout: "Tata letak",
  composition: "Komposisi",
  background: "Latar",
  imagery: "Jenis imagery",
  subject: "Subjek / objek",
  typography: "Tipografi",
  palette: "Palet warna",
  overlay: "Elemen overlay",
  transition: "Transisi",
};

const IMAGE_BRIEF_LABELS: Record<string, string> = {
  composition: "Komposisi",
  subject: "Subjek",
  background: "Latar",
  lighting: "Pencahayaan",
  palette: "Palet warna",
  typography: "Tipografi",
  negativeSpace: "Ruang kosong / safe area",
};

const CREATIVE_LABELS: Record<string, string> = {
  targetPembaca: "Target pembaca",
  toneOfVoice: "Tone of voice",
  keyMessage: "Key message",
  callToAction: "Call to action",
};

/** Susun brief jadi Markdown lengkap. */
export function briefToMarkdown(meta: BriefMeta, draft: BriefData): string {
  const lines: string[] = [];
  lines.push(`# ${meta.topic || "Draf Brief"}`);
  lines.push("");
  lines.push(`**Format:** ${contentTypeLabel(draft.contentType)}`);
  if (meta.angle) lines.push(`**Angle:** ${meta.angle}`);
  if (meta.scenario) lines.push(`**Skenario:** ${meta.scenario}`);
  const assets: string[] = [];
  if (meta.imageCount > 0) assets.push(`${meta.imageCount} gambar`);
  if (meta.links.length > 0) assets.push(`${meta.links.length} link referensi`);
  if (assets.length > 0) lines.push(`**Aset:** ${assets.join(" · ")}`);
  if (meta.savedAt) lines.push(`**Disimpan:** ${meta.savedAt}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  const data = draft.data as unknown as Record<string, unknown>;

  // Arah kreatif — ada di semua tipe konten.
  const creative = data.creativeDirection as Record<string, string> | undefined;
  if (creative) {
    lines.push("## Arah kreatif");
    lines.push(
      ...facts(
        Object.entries(CREATIVE_LABELS).map(([key, label]) => ({
          label,
          value: creative[key] ?? "",
        }))
      )
    );
    lines.push("");
  }

  if (draft.contentType === "article") {
    lines.push("## Judul");
    lines.push(String(data.headline ?? ""));
    lines.push("");
    lines.push("## Caption");
    lines.push(String(data.caption ?? ""));
    lines.push("");
    lines.push("## Outline / subjudul");
    (data.outline as string[] | undefined)?.forEach((item, index) => {
      lines.push(`${index + 1}. ${item}`);
    });
    lines.push("");
    lines.push("## Isi artikel");
    lines.push(htmlToText(String(data.body ?? "")));
  }

  if (draft.contentType === "video") {
    lines.push("## Pengaturan");
    lines.push(
      `- Durasi: ${String(data.durationSec)} detik\n- Aspect ratio: ${String(data.aspectRatio)}\n- Avatar: ${String(data.avatar)}`
    );
    lines.push("");
    lines.push("## Ringkasan");
    lines.push(String(data.summary ?? ""));
    lines.push("");
    lines.push("## Caption");
    lines.push(String(data.caption ?? ""));
    lines.push("");
    lines.push("## Daftar adegan");
    (data.scenes as SceneLike[] | undefined)?.forEach((scene, index) => {
      lines.push(
        `### Adegan ${index + 1} — ${scene.startSec}s–${scene.endSec}s${
          scene.role ? ` · ${scene.role}` : ""
        }`
      );
      if (scene.narration) lines.push(`**Narasi:** ${scene.narration}`);
      if (scene.visualText) lines.push(`**Teks visual:** ${scene.visualText}`);
      if (scene.visualBrief) {
        lines.push(
          ...facts(
            Object.entries(SCENE_BRIEF_LABELS).map(([key, label]) => ({
              label,
              value: scene.visualBrief?.[key] ?? "",
            })),
            true
          )
        );
      }
      lines.push("");
    });
  }

  if (draft.contentType === "image") {
    lines.push("## Pengaturan");
    lines.push(
      `- Aspect ratio: ${String(data.aspectRatio)}\n- Avatar: ${String(data.avatar)}`
    );
    lines.push("");
    const imageBrief = data.visualBrief as Record<string, string> | undefined;
    if (imageBrief) {
      lines.push("## Visual brief");
      lines.push(
        ...facts(
          Object.entries(IMAGE_BRIEF_LABELS).map(([key, label]) => ({
            label,
            value: imageBrief[key] ?? "",
          }))
        )
      );
      lines.push("");
    }
    lines.push("## Teks visual");
    lines.push(String(data.visualText ?? ""));
    lines.push("");
    lines.push("## Caption");
    lines.push(String(data.caption ?? ""));
  }

  if (draft.contentType === "carousel") {
    lines.push("## Pengaturan");
    lines.push(
      `- Jumlah slide: ${String(data.slideCount)}\n- Aspect ratio: ${String(data.aspectRatio)}`
    );
    lines.push("");
    lines.push("## Ringkasan");
    lines.push(String(data.summary ?? ""));
    lines.push("");
    lines.push("## Caption");
    lines.push(String(data.caption ?? ""));
    lines.push("");
    lines.push("## Daftar slide");
    (data.slides as SlideLike[] | undefined)?.forEach((slide, index) => {
      lines.push(`### Slide ${index + 1}${slide.role ? ` · ${slide.role}` : ""}`);
      if (slide.headline) lines.push(`**Judul:** ${slide.headline}`);
      if (slide.bodyText) lines.push(`**Body:** ${slide.bodyText}`);
      if (slide.visualText) lines.push(`**Teks visual:** ${slide.visualText}`);
      if (slide.visualBrief) {
        lines.push(
          ...facts(
            Object.entries(SLIDE_BRIEF_LABELS).map(([key, label]) => ({
              label,
              value: slide.visualBrief?.[key] ?? "",
            })),
            true
          )
        );
      }
      lines.push("");
    });
  }

  const hashtags = (data.hashtags as string[] | undefined) ?? [];
  if (hashtags.length > 0) {
    lines.push("## Suggestion hashtags");
    lines.push(hashtags.join(" "));
  }

  lines.push("");
  lines.push("---");
  lines.push("*Dibuat dengan ContentDesk — draf mock untuk prototipe.*");
  return lines.join("\n");
}

/** Unduh string sebagai file. */
function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** Nama file aman dari topik. */
export function fileSlug(topic: string): string {
  return (
    topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "draf-brief"
  );
}

export function exportMarkdown(meta: BriefMeta, draft: BriefData): void {
  download(
    `${fileSlug(meta.topic)}.md`,
    briefToMarkdown(meta, draft),
    "text/markdown;charset=utf-8"
  );
}

export function exportJson(meta: BriefMeta, draft: BriefData): void {
  download(
    `${fileSlug(meta.topic)}.json`,
    JSON.stringify({ meta, draft }, null, 2),
    "application/json;charset=utf-8"
  );
}
