import type {
  AngleOption,
  ArticleDraft,
  BriefData,
  BriefSectionKey,
  CarouselDraft,
  ContentTypeId,
  GenerateAnglesInput,
  GenerateBriefInput,
  ImageDraft,
  IdeationService,
  InternalAssetItem,
  SceneDraft,
  SearchAssetsInput,
  SlideDraft,
  TopicIdea,
  VideoDraft,
} from "@/types/ideation";
import { getDemoState } from "../demo-state";
import {
  AVATAR_OPTIONS,
  CAROUSEL_ASPECT_OPTIONS,
  IMAGE_ASPECT_OPTIONS,
  VIDEO_ASPECT_OPTIONS,
} from "@/config/brief-options";
import { randInt, randRange } from "./random";
import { topicsForCluster } from "./topics";
import { MOCK_INTERNAL_ASSETS } from "./internal-assets";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Simulasi latensi AI + state demo (?state=loading|empty|error). */
async function simulate<T>(produce: () => T, empty: () => T): Promise<T> {
  const state = getDemoState();
  if (state === "loading") {
    await new Promise<never>(() => {});
  }
  if (state === "error") {
    await sleep(500);
    throw new Error(
      "Layanan AI sedang tidak tersedia. Silakan coba lagi beberapa saat lagi."
    );
  }
  if (state === "empty") return empty();
  await sleep(600 + Math.random() * 600);
  return produce();
}

/* ---------------- Topic ideas ---------------- */

const REASONS = [
  "Volume pembacaan naik tajam 7 hari terakhir di cluster yang sama.",
  "Kompetitor banyak mengangkat topik ini dengan performa di atas rata-rata.",
  "Pencarian internal pembaca meningkat dibanding periode sebelumnya.",
  "Konten serupa mendapat interaksi 1,8× di atas median konten lain.",
  "Sedang menjadi sorotan di linimasa media sosial pagi ini.",
];

const SOURCES = [
  "Media sosial kompetitor",
  "Pencarian internal",
  "Tren kanal (mock)",
  "Monitor berita masuk",
  "Data performa historis",
];

function trendSignal(topic: string, index: number): string {
  const change = Math.round(randRange(8, 46, "trend", topic, index));
  return `+${change}% (7 hari)`;
}

function toTopicIdea(
  seed: { id: string; title: string; score: number },
  index: number
): TopicIdea {
  return {
    id: seed.id,
    title: seed.title,
    reason: REASONS[index % REASONS.length],
    trendSignal: trendSignal(seed.title, index),
    source: SOURCES[index % SOURCES.length],
    score: seed.score,
  };
}

/* ---------------- Angles ---------------- */

interface AngleTemplate {
  title: string;
  describe: (topic: string) => string;
  /** Setiap angle mengunci satu format konten (bukan pilih terpisah). */
  contentType: ContentTypeId;
}

const ANGLE_TEMPLATES: AngleTemplate[] = [
  {
    title: "Fakta & angka terkini",
    describe: (topic) =>
      `Rekap data dan angka resmi terbaru seputar ${topic} dalam format ringkas yang mudah dibagikan.`,
    contentType: "article",
  },
  {
    title: "Sudut pandang warga",
    describe: (topic) =>
      `Cerita personal dan dampak nyata ${topic} dari perspektif orang yang mengalaminya langsung.`,
    contentType: "video",
  },
  {
    title: "Mitos vs fakta",
    describe: (topic) =>
      `Meluruskan anggapan yang beredar tentang ${topic} dengan membandingkan klaim dan buktinya.`,
    contentType: "image",
  },
  {
    title: "Langkah praktis",
    describe: (topic) =>
      `Panduan bertahap yang bisa langsung dipraktikkan pembaca terkait ${topic}.`,
    contentType: "carousel",
  },
];

function angleBasis(
  topic: string,
  scenario: GenerateAnglesInput["scenario"],
  index: number
): string {
  if (scenario === "recommended") {
    const count = Math.round(randRange(18, 64, "ang-n", topic, index));
    const er = randRange(5.4, 9.2, "ang-er", topic, index).toFixed(1);
    return `Berdasarkan ${count} konten serupa 30 hari terakhir: ER ${er}% — di atas median cluster.`;
  }
  const change = Math.round(randRange(9, 38, "ang-t", topic, index));
  return `Berdasarkan sinyal tren "${topic}" naik ${change}% (7 hari) dari data historis dan pencarian.`;
}

/* ---------------- Brief drafts ---------------- */

const ARTICLE_HEADLINES = [
  (topic: string) => topic,
  (topic: string) => `${topic}: Yang Perlu Anda Tahuh Hari Ini`,
  (topic: string) => `Mengapa ${topic} Menjadi Sorotan Pekan Ini`,
  (topic: string) => `${topic} dalam Angka: Rekap Lengkap`,
];

const ARTICLE_OUTLINE_TEMPLATES: string[][] = [
  ["Latar belakang", "Fakta utama", "Dampak bagi pembaca", "Langkah selanjutnya"],
  ["Apa yang terjadi", "Siapa yang terdampak", "Kutipan kunci", "Rekomendasi praktis"],
  ["Konteks singkat", "Data pendukung", "Sudut pandang berbeda", "Yang perlu diwaspadai"],
];

const ARTICLE_BODY_VARIANTS = [
  (topic: string, angle: string) =>
    `<p>Topik <strong>${topic}</strong> mendapat perhatian besar pekan ini. Draf ini disusun dengan angle <em>${angle}</em> agar relevan dengan pembaca setia.</p>` +
    `<h2>Latar belakang</h2>` +
    `<p>Paragraf pembuka menjelaskan kronologi singkat beserta angka-angka kunci yang melatarbelakangi topik ini.</p>` +
    `<h2>Fakta utama</h2>` +
    `<p>Ringkasan temuan penting disertai kutipan sumber resmi. Setiap klaim dilengkapi tautan rujukan agar mudah diverifikasi redaktur sebelum tayang.</p>` +
    `<h2>Dampak bagi pembaca</h2>` +
    `<p>Penutup menghubungkan topik dengan kehidupan sehari-hari pembaca dan mengarahkan ke langkah praktis berikutnya.</p>`,
  (topic: string, angle: string) =>
    `<p> Artikel ini mengangkat <strong>${topic}</strong> dengan pendekatan <em>${angle}</em>, berbasis data performa historis 30 hari terakhir.</p>` +
    `<h2>Apa yang terjadi</h2>` +
    `<p>Paragraf pembuka merangkum peristiwa dan mengapa topik ini tiba-tiba menarik perhatian.</p>` +
    `<h2>Data pendukung</h2>` +
    `<p>Paragraf berisi angka, grafik referensi, dan perbandingan dengan periode sebelumnya.</p>` +
    `<h2>Rekomendasi praktis</h2>` +
    `<p>Daftar langkah konkret yang bisa langsung dipraktikkan pembaca, ditutup dengan ajakan berdiskusi di kolom komentar.</p>`,
];

const VIDEO_ASPECTS = VIDEO_ASPECT_OPTIONS;
const AVATARS = AVATAR_OPTIONS;
const IMAGE_ASPECTS = IMAGE_ASPECT_OPTIONS;
const CAROUSEL_ASPECTS = CAROUSEL_ASPECT_OPTIONS;

const VIDEO_SUMMARIES = [
  (topic: string, angle: string) =>
    `Video 30 detik menjelaskan ${topic} dengan angle "${angle}" — pembuka cepat, tiga poin utama, lalu ajakan simpan konten.`,
  (topic: string, angle: string) =>
    `Ringkasan visual ${topic}: satu hook di 3 detik pertama, fakta kunci di tengah, dan penutup yang mengaitkan angle "${angle}" dengan kehidupan pembaca.`,
  (topic: string, angle: string) =>
    `Draf video ${topic} berdurasi 30 detik dengan gaya cepat dan subtitle besar, mengangkat angle "${angle}" untuk penonton baru.`,
];

const SCENE_TEXTS = [
  ["Hook: kalimat pembuka yang mengejutkan tentang topik.", "B-roll kunci + voice-overs fakta utama.", "Penutup: rangkuman singkat + ajakan simpan konten."],
  ["Cuplikan situasi terbaru dengan teks besar di layar.", "Grafik angka sederhana disertai narasi.", "Call-to-action: ikuti akun untuk update berikutnya."],
  ["Pertanyaan pembuka ke penonton.", "Tiga fakta cepat berturut-turut dengan visual pendukung.", "Kutipan penutup dan ajakan komentar."],
];

const IMAGE_TEXTS = [
  (topic: string) => `Judul besar: ${topic} — poin penting dalam satu layar.`,
  (topic: string) => `${topic}: tiga angka kunci yang wajib diketahui.`,
  (topic: string) => `Infografik ringkas ${topic} dengan ikon dan angka.`,
];

const SLIDE_TEXTS = [
  "Hook slide: satu kalimat pembuka yang bikin lanjut.",
  "Slide fakta: angka utama dengan ikon pendukung.",
  "Slide penjelasan: konteks singkat topik.",
  "Slide contoh kasus nyata singkat.",
  "Slide tips: langkah praktis untuk pembaca.",
  "Slide rangkuman poin-poin utama.",
  "Slide penutup: ajakan simpan & bagikan.",
];

function scenesFor(durationSec: number, variant: number): SceneDraft[] {
  const count = 3;
  const per = Math.round(durationSec / count);
  return Array.from({ length: count }, (_, i) => ({
    id: `scene-${i + 1}`,
    startSec: i * per,
    endSec: i === count - 1 ? durationSec : (i + 1) * per,
    media: `Mock render adegan ${i + 1}`,
    visualText: SCENE_TEXTS[variant % SCENE_TEXTS.length][i],
  }));
}

function buildVideoDraft(
  topic: string,
  angle: string,
  variant: number
): VideoDraft {
  const durationSec = [30, 45, 60][variant % 3];
  return {
    durationSec,
    aspectRatio: VIDEO_ASPECTS[variant % VIDEO_ASPECTS.length],
    avatar: AVATARS[variant % AVATARS.length],
    summary: VIDEO_SUMMARIES[variant % VIDEO_SUMMARIES.length](topic, angle),
    scenes: scenesFor(durationSec, variant),
  };
}

function buildArticleDraft(
  topic: string,
  angle: string,
  variant: number
): ArticleDraft {
  return {
    headline: ARTICLE_HEADLINES[variant % ARTICLE_HEADLINES.length](topic),
    outline: [...ARTICLE_OUTLINE_TEMPLATES[variant % ARTICLE_OUTLINE_TEMPLATES.length]],
    body: ARTICLE_BODY_VARIANTS[variant % ARTICLE_BODY_VARIANTS.length](topic, angle),
  };
}

function buildImageDraft(
  topic: string,
  variant: number
): ImageDraft {
  return {
    aspectRatio: IMAGE_ASPECTS[variant % IMAGE_ASPECTS.length],
    avatar: AVATARS[variant % AVATARS.length],
    media: "Mock render image",
    visualText: IMAGE_TEXTS[variant % IMAGE_TEXTS.length](topic),
  };
}

function buildCarouselDraft(
  topic: string,
  variant: number
): CarouselDraft {
  const slideCount = [4, 5, 6][variant % 3];
  const slides: SlideDraft[] = Array.from({ length: slideCount }, (_, i) => ({
    id: `slide-${i + 1}`,
    media: `Mock render slide ${i + 1}`,
    visualText:
      i === 0
        ? IMAGE_TEXTS[variant % IMAGE_TEXTS.length](topic)
        : SLIDE_TEXTS[i % SLIDE_TEXTS.length],
  }));
  return { slideCount, aspectRatio: CAROUSEL_ASPECTS[variant % CAROUSEL_ASPECTS.length], slides };
}

function applyComment(draft: BriefData, comment: string): BriefData {
  const note = comment.trim();
  if (!note) return draft;
  switch (draft.contentType) {
    case "article":
      return {
        ...draft,
        data: { ...draft.data, body: `${draft.data.body}<p><em>Catatan redaktur: ${note}</em></p>` },
      };
    case "video":
      return {
        ...draft,
        data: { ...draft.data, summary: `${draft.data.summary} (Revisi: ${note})` },
      };
    case "image":
      return {
        ...draft,
        data: { ...draft.data, visualText: `${draft.data.visualText} — ${note}` },
      };
    case "carousel":
      return {
        ...draft,
        data: {
          ...draft.data,
          slides: draft.data.slides.map((slide, i) =>
            i === 0 ? { ...slide, visualText: `${slide.visualText} — ${note}` } : slide
          ),
        },
      };
  }
}

function varySection(draft: BriefData, section: BriefSectionKey, variant: number): BriefData {
  switch (draft.contentType) {
    case "article": {
      const data = { ...draft.data };
      if (section === "headline") {
        data.headline = ARTICLE_HEADLINES[variant % ARTICLE_HEADLINES.length](data.headline);
      }
      if (section === "outline") {
        data.outline = [...ARTICLE_OUTLINE_TEMPLATES[variant % ARTICLE_OUTLINE_TEMPLATES.length]];
      }
      if (section === "body") {
        data.body = ARTICLE_BODY_VARIANTS[variant % ARTICLE_BODY_VARIANTS.length](
          data.headline,
          data.outline[0]
        );
      }
      return { ...draft, data };
    }
    case "video": {
      if (section === "settings") {
        const next = buildVideoDraft("t", "a", variant + 1);
        return {
          ...draft,
          data: {
            ...draft.data,
            durationSec: next.durationSec,
            aspectRatio: next.aspectRatio,
            avatar: next.avatar,
            scenes: scenesFor(next.durationSec, variant),
          },
        };
      }
      if (section === "summary") {
        return {
          ...draft,
          data: {
            ...draft.data,
            summary: VIDEO_SUMMARIES[variant % VIDEO_SUMMARIES.length]("topik ini", "angle terpilih"),
          },
        };
      }
      if (section === "scenes") {
        return { ...draft, data: { ...draft.data, scenes: scenesFor(draft.data.durationSec, variant) } };
      }
      return draft;
    }
    case "image": {
      if (section === "settings") {
        return {
          ...draft,
          data: {
            ...draft.data,
            aspectRatio: IMAGE_ASPECTS[variant % IMAGE_ASPECTS.length],
            avatar: AVATARS[variant % AVATARS.length],
          },
        };
      }
      if (section === "visual") {
        return {
          ...draft,
          data: {
            ...draft.data,
            media: `Mock render image (varian ${variant + 1})`,
            visualText: IMAGE_TEXTS[variant % IMAGE_TEXTS.length]("Topik terpilih"),
          },
        };
      }
      return draft;
    }
    case "carousel": {
      if (section === "settings") {
        const next = buildCarouselDraft("t", variant + 1);
        const slides: SlideDraft[] = Array.from(
          { length: next.slideCount },
          (_, i) =>
            draft.data.slides[i] ?? {
              id: `slide-${i + 1}`,
              media: `Mock render slide ${i + 1}`,
              visualText: SLIDE_TEXTS[i % SLIDE_TEXTS.length],
            }
        );
        return {
          ...draft,
          data: { ...draft.data, slideCount: next.slideCount, aspectRatio: next.aspectRatio, slides },
        };
      }
      if (section === "slides") {
        return {
          ...draft,
          data: {
            ...draft.data,
            slides: draft.data.slides.map((slide, i) => ({
              ...slide,
              media:
                i === variant % draft.data.slides.length
                  ? `Mock render slide ${i + 1} (varian ${variant + 1})`
                  : slide.media,
              visualText:
                i === variant % draft.data.slides.length
                  ? SLIDE_TEXTS[(variant + i) % SLIDE_TEXTS.length]
                  : slide.visualText,
            })),
          },
        };
      }
      return draft;
    }
  }
}

function buildBrief(input: GenerateBriefInput): BriefData {
  const variant = input.nonce ?? 0;
  const angle = input.angle.title;
  let draft: BriefData;
  switch (input.contentType) {
    case "article":
      draft = { contentType: "article", data: buildArticleDraft(input.topic, angle, variant) };
      break;
    case "video":
      draft = { contentType: "video", data: buildVideoDraft(input.topic, angle, variant) };
      break;
    case "image":
      draft = { contentType: "image", data: buildImageDraft(input.topic, variant) };
      break;
    case "carousel":
      draft = { contentType: "carousel", data: buildCarouselDraft(input.topic, variant) };
      break;
  }
  if (input.section) {
    draft = varySection(draft, input.section, variant);
  }
  return applyComment(draft, input.comment ?? "");
}

/* ---------------- Service ---------------- */

function delayFor(kind: "angles" | "brief"): number {
  const base = kind === "angles" ? 700 : 1500;
  const spread = kind === "angles" ? 500 : 900;
  return base + randInt(0, spread, "latency", kind, Date.now() % 97);
}

async function listTopicIdeas(): Promise<TopicIdea[]> {
  return simulate(
    () => topicsForCluster().map(toTopicIdea),
    () => []
  );
}

async function generateAngles(input: GenerateAnglesInput): Promise<AngleOption[]> {
  const state = getDemoState();
  if (state === "loading") return new Promise<never>(() => {});
  if (state === "error") {
    await sleep(delayFor("angles"));
    throw new Error("Gagal membuat opsi angle. Silakan coba lagi.");
  }
  await sleep(delayFor("angles"));
  if (state === "empty") return [];
  return ANGLE_TEMPLATES.map((template, index) => ({
    id: `angle-${index + 1}`,
    title: template.title,
    description: template.describe(input.topic),
    basis: angleBasis(input.topic, input.scenario, index),
    contentType: template.contentType,
  }));
}

async function generateBrief(input: GenerateBriefInput): Promise<BriefData> {
  const state = getDemoState();
  if (state === "loading") return new Promise<never>(() => {});
  if (state === "error") {
    await sleep(delayFor("brief"));
    throw new Error("Gagal membuat draf brief. Silakan coba lagi.");
  }
  await sleep(delayFor("brief"));
  return buildBrief(input);
}

/** Pencarian aset internal DAM (R8 — skenario "belum punya materi"). */
async function searchInternalAssets(
  input: SearchAssetsInput
): Promise<InternalAssetItem[]> {
  const state = getDemoState();
  if (state === "loading") return new Promise<never>(() => {});
  if (state === "error") {
    await sleep(delayFor("angles"));
    throw new Error("Gagal mengambil aset internal. Silakan coba lagi.");
  }
  await sleep(delayFor("angles"));
  if (state === "empty") return [];

  const query = input.query?.trim().toLowerCase() ?? "";
  const category = input.category?.trim().toLowerCase() ?? "";
  return MOCK_INTERNAL_ASSETS.filter((asset) => {
    const matchesCategory =
      !category || asset.tags.some((tag) => tag.toLowerCase() === category);
    if (!matchesCategory) return false;
    if (!query) return true;
    return (
      asset.title.toLowerCase().includes(query) ||
      asset.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  })
    .slice()
    .sort((a, b) => b.matchScore - a.matchScore);
}

export const mockIdeationService: IdeationService = {
  listTopicIdeas,
  generateAngles,
  generateBrief,
  searchInternalAssets,
};
