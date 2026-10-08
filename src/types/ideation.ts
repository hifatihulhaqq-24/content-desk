/**
 * Kontrak data Phase 2 — ideation & draf brief (mock).
 * Kontrak ini disepakati lebih awal agar mudah diganti oleh API back end.
 */

export type ContentTypeId = "article" | "video" | "image" | "carousel";

/** Skenario masuk: pilih rekomendasi topik atau tulis topik sendiri. */
export type EntryScenario = "recommended" | "custom";

/** Kartu rekomendasi topik (R6): judul, alasan, indikator tren, sumber. */
export interface TopicIdea {
  id: string;
  title: string;
  reason: string;
  trendSignal: string;
  source: string;
  score: number;
}

/** Opsi angle (R9): judul, deskripsi singkat, alasan/dasar data. */
export interface AngleOption {
  id: string;
  title: string;
  description: string;
  basis: string;
}

/* ---------- Struktur draf per tipe konten ---------- */

export interface SceneDraft {
  id: string;
  startSec: number;
  endSec: number;
  /** Label placeholder media render (mock, generator media di luar scope). */
  media: string;
  visualText: string;
}

export interface ArticleDraft {
  headline: string;
  outline: string[];
  /** Rich text HTML (Tiptap). */
  body: string;
}

export interface VideoDraft {
  durationSec: number;
  aspectRatio: string;
  avatar: string;
  summary: string;
  scenes: SceneDraft[];
}

export interface ImageDraft {
  aspectRatio: string;
  avatar: string;
  media: string;
  visualText: string;
}

export interface SlideDraft {
  id: string;
  media: string;
  visualText: string;
}

export interface CarouselDraft {
  slideCount: number;
  aspectRatio: string;
  slides: SlideDraft[];
}

export type BriefData =
  | { contentType: "article"; data: ArticleDraft }
  | { contentType: "video"; data: VideoDraft }
  | { contentType: "image"; data: ImageDraft }
  | { contentType: "carousel"; data: CarouselDraft };

/** Bagian brief yang bisa di-regenerate terpisah (R14). */
export type BriefSectionKey =
  | "headline"
  | "outline"
  | "body"
  | "settings"
  | "summary"
  | "scenes"
  | "visual"
  | "slides";

/* ---------- Input layanan ---------- */

export interface GenerateAnglesInput {
  topic: string;
  scenario: EntryScenario;
}

export interface GenerateBriefInput {
  topic: string;
  scenario: EntryScenario;
  angle: { id: string; title: string };
  contentType: ContentTypeId;
  /** Regenerate per bagian; tanpa ini = generate/ regenerate seluruh draf. */
  section?: BriefSectionKey;
  /** Komentar user untuk arah regenerate. */
  comment?: string;
  /** Inkrementasi agar regenerate menghasilkan varian berbeda (deterministik). */
  nonce?: number;
}

export interface IdeationService {
  /** 5 rekomendasi topik untuk landing. */
  listTopicIdeas(): Promise<TopicIdea[]>;
  generateAngles(input: GenerateAnglesInput): Promise<AngleOption[]>;
  generateBrief(input: GenerateBriefInput): Promise<BriefData>;
}
