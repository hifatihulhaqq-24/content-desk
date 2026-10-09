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
  /** Setiap angle mengunci satu format konten spesifik (R10/R11). */
  contentType: ContentTypeId;
}

/* ---------- Aset (R8: kesiapan materi) ---------- */

/** Tipe aset yang diupload user. */
export interface UploadedMediaItem {
  id: string;
  name: string;
  size: number;
  type: "image" | "video" | "document";
  previewUrl?: string;
}

/** Aset internal dari DAM perusahaan. */
export interface InternalAssetItem {
  id: string;
  title: string;
  type: "image" | "video";
  thumbnailUrl: string;
  resolution: string;
  matchScore: number;
  tags: string[];
  sourceDate: string;
}

/* ---------- Struktur draf per tipe konten ---------- */

/**
 * Brief visual satu adegan video — deskripsi teknis yang cukup detail untuk
 * dijadikan prompt generator media (sudut kamera, suasana, subjek, dsb).
 */
export interface SceneBrief {
  /** Sudut & ukuran pengambilan (mis. "close-up eye-level", "wide establishing"). */
  shotAngle: string;
  /** Gerak kamera (static, push-in, pan, handheld, dsb). */
  cameraMotion: string;
  /** Lokasi/latar tempat kejadian. */
  setting: string;
  /** Suasana, waktu, pencahayaan alami, mood. */
  ambient: string;
  /** Penggambaran karakter/benda: usia, pakaian, ekspresi, properti. */
  subject: string;
  /** Pencahayaan buatan & suhu warna. */
  lighting: string;
  /** Palet warna dominan. */
  palette: string;
  /** Teks overlay/subtitle & tipografi yang tampil di layar. */
  onScreenText: string;
  /** Audio: voice-over, musik, SFX. */
  audio: string;
  /** Transisi keluar ke adegan berikutnya. */
  transition: string;
}

/** Peran naratif sebuah adegan dalam alur video. */
export type SceneRole = "hook" | "isi" | "cta";

export interface SceneDraft {
  id: string;
  startSec: number;
  endSec: number;
  /** Peran adegan dalam alur (hook/isi/cta). */
  role: SceneRole;
  /** Label placeholder media render (mock, generator media di luar scope). */
  media: string;
  /** Teks visual/subtitle yang tampil di layar. */
  visualText: string;
  /** Naskah voice-over / narasi untuk adegan ini. */
  narration: string;
  /** Brief visual teknis adegan ini. */
  visualBrief: SceneBrief;
}

/**
 * Brief visual satu slide carousel — deskripsi komposisi & tipografi yang
 * cukup detail untuk dijadikan prompt generator media.
 */
export interface SlideBrief {
  /** Tata letak slide (mis. "hero text kiri, gambar kanan"). */
  layout: string;
  /** Komposisi & penempatan elemen. */
  composition: string;
  /** Latar/gradien/tekstur slide. */
  background: string;
  /** Jenis imagery: foto, ilustrasi flat, ikon, dsb. */
  imagery: string;
  /** Penggambaran subjek/benda utama. */
  subject: string;
  /** Tipografi: ukuran, berat, casing. */
  typography: string;
  /** Palet warna dominan. */
  palette: string;
  /** Elemen overlay: badge, garis aksen, angka besar. */
  overlay: string;
  /** Transisi ke slide berikutnya. */
  transition: string;
}

/** Peran naratif sebuah slide dalam alur carousel. */
export type SlideRole = "hook" | "masalah" | "data" | "tips" | "bukti" | "cta";

export interface SlideDraft {
  id: string;
  media: string;
  /** Peran slide dalam alur. */
  role: SlideRole;
  /** Judul besar slide. */
  headline: string;
  /** Body copy pendukung slide. */
  bodyText: string;
  visualText: string;
  /** Brief visual teknis slide ini. */
  visualBrief: SlideBrief;
}

/** Brief visual tunggal untuk content-type image. */
export interface ImageBrief {
  /** Tata letak & komposisi. */
  composition: string;
  /** Penggambaran subjek/benda utama. */
  subject: string;
  /** Latar & elemen pendukung. */
  background: string;
  /** Pencahayaan & suhu warna. */
  lighting: string;
  /** Palet warna dominan. */
  palette: string;
  /** Tipografi teks overlay. */
  typography: string;
  /** Ruang kosong/safe area untuk teks. */
  negativeSpace: string;
}

/** Caption pendek menyertai konten — dipakai semua tipe konten. */
export type Caption = string;

/** Rekomendasi hashtag (diawali "#") untuk distribusi. */
export type Hashtags = string[];

/**
 * Arah kreatif ringkas — dipakai semua tipe konten sebagai rujukan utama
 * sebelum masuk ke detail tiap aspek.
 */
export interface CreativeDirection {
  /** Siapa target pembaca/penonton. */
  targetPembaca: string;
  /** Nada komunikasi (formal, santai, tegas, dsb). */
  toneOfVoice: string;
  /** Satu pesan utama yang harus diingat audiens. */
  keyMessage: string;
  /** Ajakan tindakan yang diharapkan. */
  callToAction: string;
}

export interface ArticleDraft {
  headline: string;
  /** Arah kreatif — rujukan utama redaksi. */
  creativeDirection: CreativeDirection;
  /** Caption/lead singkat untuk promosi artikel. */
  caption: Caption;
  outline: string[];
  /** Rich text HTML (Tiptap). */
  body: string;
  hashtags: Hashtags;
}

export interface VideoDraft {
  durationSec: number;
  aspectRatio: string;
  avatar: string;
  summary: string;
  /** Arah kreatif — rujukan utama redaksi. */
  creativeDirection: CreativeDirection;
  /** Caption untuk deskripsi video. */
  caption: Caption;
  scenes: SceneDraft[];
  hashtags: Hashtags;
}

export interface ImageDraft {
  aspectRatio: string;
  avatar: string;
  media: string;
  visualText: string;
  /** Arah kreatif — rujukan utama redaksi. */
  creativeDirection: CreativeDirection;
  /** Brief visual tunggal (komposisi, subjek, dsb). */
  visualBrief: ImageBrief;
  /** Caption untuk unggahan gambar. */
  caption: Caption;
  hashtags: Hashtags;
}

export interface CarouselDraft {
  slideCount: number;
  aspectRatio: string;
  /** Ringkasan alur carousel — setara summary pada video. */
  summary: string;
  slides: SlideDraft[];
  /** Arah kreatif — rujukan utama redaksi. */
  creativeDirection: CreativeDirection;
  /** Caption untuk carousel. */
  caption: Caption;
  hashtags: Hashtags;
}

export type BriefData =
  | { contentType: "article"; data: ArticleDraft }
  | { contentType: "video"; data: VideoDraft }
  | { contentType: "image"; data: ImageDraft }
  | { contentType: "carousel"; data: CarouselDraft };

/** Bagian brief yang bisa di-regenerate terpisah (R14). */
export type BriefSectionKey =
  | "headline"
  | "creative"
  | "caption"
  | "outline"
  | "body"
  | "settings"
  | "summary"
  | "scenes"
  | "visual"
  | "slides"
  | "hashtags";

/* ---------- Input layanan ---------- */

/**
 * Konteks lampiran dari message box (halaman compose): gambar yang diunggah
 * & link referensi. Diteruskan ke generateAngles/generateBrief agar hasilnya
 * "sesuai topik, aset, dan link yang disertakan".
 */
export interface ReferenceContext {
  /** Jumlah gambar yang dilampirkan user. */
  imageCount: number;
  /** Link referensi yang dilampirkan user (URL sudah dinormalisasi). */
  links: string[];
}

export interface GenerateAnglesInput extends ReferenceContext {
  topic: string;
  scenario: EntryScenario;
}

/** Input pencarian aset internal DAM (R8, skenario "belum punya"). */
export interface SearchAssetsInput {
  topic: string;
  angleId?: string;
  contentType?: ContentTypeId;
  query?: string;
  category?: string;
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
  /** Konteks lampiran (gambar & link referensi) dari message box. */
  context?: ReferenceContext;
}

export interface IdeationService {
  /** 5 rekomendasi topik untuk landing. */
  listTopicIdeas(): Promise<TopicIdea[]>;
  generateAngles(input: GenerateAnglesInput): Promise<AngleOption[]>;
  generateBrief(input: GenerateBriefInput): Promise<BriefData>;
  /** Cari aset internal DAM yang relevan dengan topik/angle. */
  searchInternalAssets(input: SearchAssetsInput): Promise<InternalAssetItem[]>;
}
