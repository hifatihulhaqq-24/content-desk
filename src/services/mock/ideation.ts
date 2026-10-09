import type {
  AngleOption,
  ArticleDraft,
  BriefData,
  BriefSectionKey,
  Caption,
  CarouselDraft,
  ContentTypeId,
  CreativeDirection,
  GenerateAnglesInput,
  GenerateBriefInput,
  Hashtags,
  IdeationService,
  ImageBrief,
  ImageDraft,
  InternalAssetItem,
  ReferenceContext,
  SceneBrief,
  SceneDraft,
  SceneRole,
  SearchAssetsInput,
  SlideBrief,
  SlideDraft,
  SlideRole,
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
  index: number,
  context?: ReferenceContext
): string {
  const base =
    scenario === "recommended"
      ? (() => {
          const count = Math.round(randRange(18, 64, "ang-n", topic, index));
          const er = randRange(5.4, 9.2, "ang-er", topic, index).toFixed(1);
          return `Berdasarkan ${count} konten serupa 30 hari terakhir: ER ${er}% — di atas median cluster.`;
        })()
      : (() => {
          const change = Math.round(randRange(9, 38, "ang-t", topic, index));
          return `Berdasarkan sinyal tren "${topic}" naik ${change}% (7 hari) dari data historis dan pencarian.`;
        })();
  const note = referenceNote(context);
  return note ? `${base} ${note}` : base;
}

/** Kalimat konteks lampiran dari message box (gambar & link referensi). */
function referenceNote(context?: ReferenceContext): string {
  if (!context) return "";
  const parts: string[] = [];
  if (context.imageCount > 0) parts.push(`${context.imageCount} gambar`);
  if (context.links.length > 0) {
    parts.push(`${context.links.length} link referensi`);
  }
  if (parts.length === 0) return "";
  return `Angle disusun memakai ${parts.join(" & ")} yang kamu lampirkan.`;
}

/* ---------------- Brief drafts ---------------- */

const ARTICLE_HEADLINES = [
  (topic: string) => topic,
  (topic: string) => `${topic}: Yang Perlu Anda Tahuh Hari Ini`,
  (topic: string) => `Mengapa ${topic} Menjadi Sorotan Pekan Ini`,
  (topic: string) => `${topic} dalam Angka: Rekap Lengkap`,
];

const ARTICLE_OUTLINE_TEMPLATES: string[][] = [
  [
    "Latar belakang",
    "Fakta utama",
    "Data pendukung",
    "Dampak bagi pembaca",
    "Sudut pandang berbeda",
    "Langkah selanjutnya",
  ],
  [
    "Apa yang terjadi",
    "Siapa yang terdampak",
    "Kutipan kunci",
    "Angka penting",
    "Yang perlu diwaspadai",
    "Rekomendasi praktis",
  ],
  [
    "Konteks singkat",
    "Kronologi peristiwa",
    "Data pendukung",
    "Analisis dampak",
    "Sudut pandang berbeda",
    "Rencana ke depan",
  ],
];

const ARTICLE_BODY_VARIANTS = [
  (topic: string, angle: string) =>
    `<p>Topik <strong>${topic}</strong> mendapat perhatian besar pekan ini. Draf ini disusun dengan angle <em>${angle}</em> agar relevan dengan pembaca setia sekaligus menjaga akurasi fakta.</p>` +
    `<h2>Latar belakang</h2>` +
    `<p>Paragraf pembuka menjelaskan kronologi singkat beserta angka-angka kunci yang melatarbelakangi topik ini. Pemilihan kata diarahkan agar pembaca merasa topik ini menyentuh keseharian mereka, bukan sekadar kabar yang jauh.</p>` +
    `<p>Sertakan satu kalimat konteks waktu: kapan peristiwa ini mulai terjadi dan mengapa mulai menarik perhatian pada pekan ini.</p>` +
    `<h2>Fakta utama</h2>` +
    `<p>Ringkasan temuan penting disertai kutipan sumber resmi. Setiap klaim dilengkapi tautan rujukan agar mudah diverifikasi redaktur sebelum tayang.</p>` +
    `<blockquote><p>Data lebih kuat daripada asumsi — dan minggu ini angkanya bergerak.</p></blockquote>` +
    `<h2>Data pendukung</h2>` +
    `<p>Paragraf berisi angka, grafik referensi, dan perbandingan dengan periode sebelumnya. Sumber data dicantumkan pada akhir paragraf agar proses verifikasi cepat.</p>` +
    `<ul><li>Angka utama 1 beserta periode pembandingnya</li><li>Angka utama 2 beserta lembaga sumber resmi</li><li>Tren 30 hari terakhir dan proyeksi singkat</li></ul>` +
    `<h2>Dampak bagi pembaca</h2>` +
    `<p>Penutup menghubungkan topik dengan kehidupan sehari-hari pembaca — apa yang berubah untuk mereka secara langsung dalam minggu ini dan apa yang perlu disiapkan.</p>` +
    `<h2>Sudut pandang berbeda</h2>` +
    `<p>Sajikan satu perspektif yang jarang dibahas, lengkap dengan kutipan narasumbernya, agar artikel terasa berimbang dan tidak sepihak.</p>` +
    `<h2>Langkah selanjutnya</h2>` +
    `<p>Tiga langkah konkret yang bisa langsung dipraktikkan hari ini, ditutup dengan ajakan berdiskusi di kolom komentar dan membagikan artikel ke kanal masing-masing.</p>`,
  (topic: string, angle: string) =>
    `<p>Artikel ini mengangkat <strong>${topic}</strong> dengan pendekatan <em>${angle}</em>, berbasis data performa historis 30 hari terakhir dan wawancara singkat dengan dua narasumber.</p>` +
    `<h2>Apa yang terjadi</h2>` +
    `<p>Paragraf pembuka merangkum peristiwa dan mengapa topik ini tiba-tiba menarik perhatian publik dalam beberapa hari terakhir. Sertakan tanggal pasti agar pembaca mudah menelusuri.</p>` +
    `<h2>Siapa yang terdampak</h2>` +
    `<p>Rincian kelompok yang paling terdampak, lengkap dengan contoh kasus nyata yang disertai nama (dengan izin) atau inisial agar tetap terverifikasi.</p>` +
    `<blockquote><p>Satu kutipan kuat dari narasumber utama, dipilih karena kalimatnya mudah dibagikan ulang.</p></blockquote>` +
    `<h2>Kutipan kunci</h2>` +
    `<p>Kembangkan kutipan di atas dengan konteks: siapa yang bicara, pada kesempatan apa, dan mengapa posisinya kredibel untuk topik ini.</p>` +
    `<h2>Angka penting</h2>` +
    `<p>Daftar angka yang wajib tayang, masing-masing dengan periode dan sumber. Hindari angka tanpa konteks perbandingan.</p>` +
    `<ol><li>Angka perbandingan periode sebelumnya</li><li>Angka perubahan persentase</li><li>Proyeksi untuk periode berikutnya</li></ol>` +
    `<h2>Yang perlu diwaspadai</h2>` +
    `<p>Bagian ini menyeimbangkan optimisme: sebutkan risiko, batasan data, dan asumsi yang masih perlu dikonfirmasi sebelum artikel dinyatakan final.</p>` +
    `<h2>Rekomendasi praktis</h2>` +
    `<p>Daftar langkah konkret yang bisa langsung dipraktikkan pembaca, ditutup dengan ajakan berdiskusi di kolom komentar dan mengikuti kanal untuk pembaruan.</p>`,
  (topic: string, angle: string) =>
    `<p>Draf artikel <strong>${topic}</strong> disusun dengan angle <em>${angle}</em> dan struktur semi-naratif: konteks, bukti, lalu implikasi.</p>` +
    `<h2>Konteks singkat</h2>` +
    `<p>Paragraf pengantar yang menempatkan topik dalam kejadian lebih besar, sehingga pembaca baru langsung memahami mengapa topik ini penting hari ini.</p>` +
    `<h2>Kronologi peristiwa</h2>` +
    `<p>Urutan kejadian dari titik awal hingga hari ini, ditulis dalam empat hingga enam kalimat pendek dengan penanda waktu yang jelas.</p>` +
    `<h2>Data pendukung</h2>` +
    `<p>Angka utama disajikan dalam kalimat aktif, disertai tautan ke sumber primer. Sertakan satu kalimat yang menjelaskan metode penghitungannya.</p>` +
    `<blockquote><p>Kutipan penyeimbang dari pihak kedua agar narasi tidak hanya berasal dari satu sumber.</p></blockquote>` +
    `<h2>Analisis dampak</h2>` +
    `<p>Dua paragraf yang membedakan dampak jangka pendek dan jangka panjang, masing-masing dengan contoh konkret dari lapangan.</p>` +
    `<h2>Sudut pandang berbeda</h2>` +
    `<p>Bagian yang membahas argumen paling sering dibantah, lengkap dengan sanggahan berbasis bukti agar pembaca memperoleh gambaran utuh.</p>` +
    `<h2>Rencana ke depan</h2>` +
    `<p>Penutup berisi jadwal perkembangan yang perlu dipantau, ditambah ajakan menyimpan artikel dan mengaktifkan notifikasi kanal.</p>`,
];

/** Caption pendek untuk promosi lintas kanal. */
const CAPTION_VARIANTS = [
  (topic: string, angle: string) =>
    `${topic} dibahas tuntas dengan sudut ${angle}. Simak ringkasannya sebelum membagikannya ke tim.`,
  (topic: string, angle: string) =>
    `Semua yang perlu kamu tahu soal ${topic} — disusun ringkas dengan angle ${angle}.`,
  (topic: string, angle: string) =>
    `Poin penting ${topic} dalam satu menit baca, dengan angle ${angle} yang jarang dibahas.`,
];

/** Hashtag rekomendasi — deterministik dari topik + template. */
const HASHTAG_SETS = [
  (topic: string) => [
    topicTag(topic),
    "#InfoHariIni",
    "#KanalResmi",
    "#FaktaKunci",
    "#RingkasDanJelas",
  ],
  (topic: string) => [
    topicTag(topic),
    "#SorotanPekanIni",
    "#DataTerbaru",
    "#PanduanPraktis",
    "#WajibTahu",
  ],
  (topic: string) => [
    topicTag(topic),
    "#BacaDulu",
    "#KontenEdukatif",
    "#LangkahPraktis",
    "#BagikanInfo",
  ],
];

/** Normalisasi judul topik jadi satu kata tag (#KataBergabung). */
function topicTag(topic: string): string {
  const cleaned = topic
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  return `#${cleaned || "InfoHariIni"}`;
}

function captionFor(topic: string, angle: string, variant: number): Caption {
  return CAPTION_VARIANTS[variant % CAPTION_VARIANTS.length](topic, angle);
}

function hashtagsFor(topic: string, variant: number): Hashtags {
  return HASHTAG_SETS[variant % HASHTAG_SETS.length](topic);
}

const VIDEO_ASPECTS = VIDEO_ASPECT_OPTIONS;
const AVATARS = AVATAR_OPTIONS;
const IMAGE_ASPECTS = IMAGE_ASPECT_OPTIONS;
const CAROUSEL_ASPECTS = CAROUSEL_ASPECT_OPTIONS;

/* ---------- Arah kreatif (semua tipe konten) ---------- */

const CREATIVE_DIRECTIONS: ((topic: string, angle: string) => CreativeDirection)[] = [
  (topic, angle) => ({
    targetPembaca: `Pembaca usia 25–40 tahun yang mengikuti perkembangan ${topic} tapi belum punya waktu membaca sumber panjang.`,
    toneOfVoice: "Santai tapi berbukti — bahasa sehari-hari, tanpa jargon, setiap klaim disertai angka.",
    keyMessage: `${topic} bisa dipahami dalam satu menit asal tahu tiga hal ini — sudut "${angle}" menjelaskannya tanpa bertele-tele.`,
    callToAction: "Simpan konten ini lalu bagikan ke satu orang yang membutuhkannya.",
  }),
  (topic, angle) => ({
    targetPembaca: `Praktisi dan pengambil keputusan yang bekerja langsung dengan ${topic} setiap hari.`,
    toneOfVoice: "Profesional dan ringkas — kalimat aktif, data di depan, opini di belakang.",
    keyMessage: `Angle "${angle}" menunjukkan sisi ${topic} yang jarang dibahas media arus utama.`,
    callToAction: "Baca sampai habis, lalu komentar satu pengalaman nyata kamu.",
  }),
  (topic, angle) => ({
    targetPembaca: `Penonton baru yang pertama kali menemukan topik ${topic} dan butuh penjelasan dari nol.`,
    toneOfVoice: "Ramah dan mengajak — sapa pembaca langsung, ajak bertanya, hindari nada menggurui.",
    keyMessage: `${topic} tidak sesulit kelihatannya — mulai dari langkah kecil yang disarankan angle "${angle}".`,
    callToAction: "Ikuti kanal untuk seri lanjutan soal ${topic}.",
  }),
];

function creativeDirectionFor(topic: string, angle: string, variant: number): CreativeDirection {
  return CREATIVE_DIRECTIONS[variant % CREATIVE_DIRECTIONS.length](topic, angle);
}

/* ---------- Video ---------- */

const VIDEO_SUMMARIES = [
  (topic: string, angle: string) =>
    `Video 30–60 detik menjelaskan ${topic} dengan angle "${angle}". Alur: hook cepat di 3 detik pertama untuk menahan scroll, tiga poin utama yang masing-masing didukung satu angka atau contoh nyata, lalu penutup yang mengaitkan angle "${angle}" dengan keseharian penonton dan meminta simpan konten.`,
  (topic: string, angle: string) =>
    `Ringkasan visual ${topic}: satu pertanyaan pembuka yang memancing rasa penasaran, dua bukti berturut-turut dengan grafik sederhana, dan penutup yang menerjemahkan angle "${angle}" menjadi satu langkah praktis. Gaya cepat, subtitle besar, tanpa pembukaan lambat.`,
  (topic: string, angle: string) =>
    `Draf video ${topic} bergaya edukasi-cepat: satu mitos diluruskan di awal, data pendukung di tengah, lalu kesimpulan yang menegaskan angle "${angle}". Cocok untuk penonton baru yang belum mengikuti topik ini sebelumnya.`,
];

const IMAGE_TEXTS = [
  (topic: string) => `Judul besar: ${topic} — poin penting dalam satu layar.`,
  (topic: string) => `${topic}: tiga angka kunci yang wajib diketahui.`,
  (topic: string) => `Infografik ringkas ${topic} dengan ikon dan angka.`,
];

const CAROUSEL_SUMMARIES = [
  (topic: string, angle: string) =>
    `Carousel 5–7 slide membahas ${topic} dengan angle "${angle}". Alur: slide 1 hook satu kalimat, slide 2 memunculkan masalah yang dialami pembaca, slide 3–5 menyajikan data dan langkah praktis, slide 6 bukti/testimoni, slide 7 ajakan simpan & bagikan. Satu ide per slide, tanpa paragraf panjang.`,
  (topic: string, angle: string) =>
    `Ringkasan carousel ${topic}: pembuka cepat yang menyebut angka kejut, dua slide penjelasan dengan konteks ${topic}, satu slide berisi tips bertahap, satu slide rangkuman, ditutup call-to-action. Angle "${angle}" muncul kembali di slide penutup agar pesan utama melekat.`,
  (topic: string, angle: string) =>
    `Draf carousel ${topic} format panduan: masalah → fakta → tiga langkah → hasil yang diharapkan → ajakan. Angle "${angle}" menjadi benang merah tiap slide, dengan tipografi besar dan satu warna aksen yang konsisten di seluruh slide.`,
];

/* ---------- Adegan video ---------- */

/**
 * Sudut & ukuran pengambilan dipasangkan dengan subjeknya — close-up tidak
 * mungkin menampilkan meja rapat, wide shot tidak mungkin memuat wajah presenter.
 * Dipilih per peran: hook agresif, isi informatif, cta menghadap penonton.
 */
const SCENE_FRAMING: Record<SceneRole, { shotAngle: string; subject: string }[]> = {
  hook: [
    {
      shotAngle: "Close-up eye-level, wajah menempati 60% frame sebelah kiri, ruang kosong di kanan untuk overlay",
      subject: "Presenter 25–30 tahun, kaos polos netral, ekspresi fokus menatap kamera, tangan menunjuk ke arah overlay",
    },
    {
      shotAngle: "Medium close-up dengan sedikit dutch angle (5°) untuk kesan mendesak",
      subject: "Presenter berusia 30-an dengan kemeja tanpa dasi, senyum tipis, postur tegak",
    },
    {
      shotAngle: "Insert shot tangan memegang objek terkait topik, lalu tilt naik ke wajah",
      subject: "Tangan dewasa memegang objek terkait topik, lengan berlengan digulung, arloji sederhana",
    },
  ],
  isi: [
    {
      shotAngle: "Medium shot dua orang berdialog, sejajar bahu, ruang tatap menghadap satu sama lain",
      subject: "Dua narasumber berpakaian rapi kasual, duduk berhadapan, gestur terbuka saat menjelaskan",
    },
    {
      shotAngle: "Over-the-shoulder dari balik pundak narasumber, subjek utama di sepertiga kanan",
      subject: "Dua narasumber berpakaian rapi kasual, duduk berhadapan, gestur terbuka saat menjelaskan",
    },
    {
      shotAngle: "Wide establishing lokasi sebelum masuk ke detail, kamera statis",
      subject: "Sekelompok tiga orang berdiskusi di sekitar meja, masing-masing memegang berkas",
    },
    {
      shotAngle: "Top-down (god view) meja/berkas terkait topik, subjek mengatur objek di tengah frame",
      subject: "Tangan dewasa memegang objek terkait topik, lengan berlengan digulung, arloji sederhana",
    },
    {
      shotAngle: "Medium shot presenter menghadap kamera dengan b-roll potong di sela narasi",
      subject: "Presenter 25–30 tahun, kaos polos netral, ekspresi fokus menatap kamera, tangan menunjuk ke arah overlay",
    },
  ],
  cta: [
    {
      shotAngle: "Medium shot presenter menghadap langsung ke kamera, sejajar mata, posisi center",
      subject: "Presenter berusia 30-an dengan kemeja tanpa dasi, senyum tipis, postur tegak",
    },
    {
      shotAngle: "Close-up wajah tersenyum dengan ruang kosong di bawah untuk tombol/teks CTA",
      subject: "Presenter 25–30 tahun, kaos polos netral, ekspresi fokus menatap kamera, tangan menunjuk ke arah overlay",
    },
    {
      shotAngle: "Wide pull-back yang perlahan menjauh, menutup adegan dengan lapang",
      subject: "Sekelompok tiga orang berdiskusi di sekitar meja, masing-masing memegang berkas",
    },
  ],
};

/** Gerak kamera per peran. */
const SCENE_MOTIONS: Record<SceneRole, string[]> = {
  hook: [
    "Push-in lambat 8% selama 2 detik lalu berhenti tajam",
    "Handheld halus dengan goyang 2% untuk kesan dokumenter",
    "Snap zoom cepat 15% dalam 0,5 detik lalu diam",
  ],
  isi: [
    "Static statis — semua gerakan datang dari subjek",
    "Pan kanan-perlahan mengikuti arah bicara subjek",
    "Slider kiri ke kanan 10% selama 4 detik",
    "Tilt turun dari atas objek ke tangan yang menunjuk",
    "Push-in sangat lambat 5% selama seluruh narasi",
  ],
  cta: [
    "Static, lalu push-in 6% pada dua detik terakhir",
    "Dolly mundur perlahan 8% selama 3 detik",
    "Handheld stabil dengan sedikit bob naik-turun",
  ],
};

/** Urutan kata untuk penomoran adegan isi — menjaga narasi tetap berurutan. */
const ORDINALS = ["Pertama", "Kedua", "Ketiga", "Keempat", "Kelima", "Keenam"];

/** Isi fakta — dirotasi varian, tapi selalu ditulis dengan nomor urut yang benar. */
const ISI_FACTS: ((topic: string) => string)[] = [
  (t) => `apa yang terjadi dengan ${t}, kapan mulanya, dan siapa yang paling terdampak`,
  (t) => `angka resmi terbaru terkait ${t} beserta periode pembandingnya`,
  (t) => `contoh nyata dari lapangan yang membuat gambaran ${t} jadi konkret`,
  (t) => `kutipan singkat narasumber yang menjelaskan mengapa ${t} berubah`,
  (t) => `hal yang paling sering disalahpahami tentang ${t} beserta koreksinya`,
  (t) => `perbandingan ${t} dengan periode yang sama tahun sebelumnya`,
];

const ISI_LABELS = [
  "Kronologi singkat",
  "Angka resmi terbaru",
  "Contoh nyata di lapangan",
  "Kutipan narasumber kunci",
  "Salah kaprah yang perlu diluruskan",
  "Perbandingan tahun sebelumnya",
];

/**
 * Naskah & teks layar untuk adegan pembuka dan penutup. Keduanya hanya muncul
 * sekali per video, jadi dipilih langsung dari `variant` supaya regenerate
 * benar-benar memberi kalimat baru. Adegan isi ditangani `isiNarration` /
 * `isiVisualText` agar penomorannya tidak kacau.
 */
const SCENE_HOOK_NARRATIONS: ((topic: string) => string)[] = [
  (t) => `“Tiga detik. Itu waktu yang kita punya untuk membahas ${t}.”`,
  (t) => `“Ada satu angka soal ${t} yang jarang dibicarakan — dan hari ini kita buka.”`,
  (t) => `“Sebelum kamu scroll, ini yang perlu diketahui soal ${t}.”`,
];

const SCENE_HOOK_TEXTS: ((topic: string) => string)[] = [
  (t) => `${t}: apa yang sebenarnya terjadi?`,
  (t) => `3 detik untuk memahami ${t}`,
  (t) => (t ? `Angka ini jarang dibahas soal ${t}` : "Angka ini jarang dibahas"),
];

const SCENE_CTA_NARRATIONS: ((topic: string) => string)[] = [
  (t) => `Jadi, mulai hari ini: simak ${t} sampai tuntas dan praktikkan satu langkah pertama.`,
  (t) => `Ringkasnya, ${t} bukan soal rumit — tinggal mulai dari yang terkecil.`,
  (t) => `Ikuti akun ini untuk kelanjutan pembahasan ${t} minggu depan.`,
];

const SCENE_CTA_TEXTS: ((topic: string) => string)[] = [
  () => "Simpan konten ini",
  () => "Mulai dari langkah kecil",
  (t) => `Ikuti untuk seri ${t} berikutnya`,
];

/** Naskah adegan isi ke-`nth` (0-based). */
function isiNarration(topic: string, nth: number, variant: number): string {
  const fact = ISI_FACTS[(nth + variant) % ISI_FACTS.length];
  return `${ORDINALS[nth] ?? `Ke-${nth + 1}`}, ${fact(topic)}.`;
}

/** Teks layar adegan isi ke-`nth` (0-based). */
function isiVisualText(topic: string, nth: number, variant: number): string {
  const label = ISI_LABELS[(nth + variant) % ISI_LABELS.length];
  return topic ? `${label} — ${topic}` : label;
}

/** Audio: VO, musik, SFX. */
const SCENE_AUDIO: Record<SceneRole, string[]> = {
  hook: [
    "Voice-over tegas 0–3 detik + sound design whoosh pelan saat masuk, tanpa musik dulu",
    "Voice-over + satu hit drum rendah di kalimat terakhir hook",
    "Voice-over + reverse cymbal 0,4 detik sebelum cut",
  ],
  isi: [
    "Voice-over konstan, musik lo-fi volume 20% di bawah VO",
    "Voice-over + SFX penunjuk (pop) tiap angka muncul",
    "Voice-over + musik ambient naik 10% pada kalimat data",
    "Dua VO berselang (narator & narasumber), musik dijaga rendah",
    "Voice-over + typing SFX saat daftar muncul",
  ],
  cta: [
    "Voice-over hangat + musik naik 15% untuk penutup",
    "Voice-over + satu ding nada tinggi saat tombol muncul",
    "Musik berakhir dengan resolve, VO terakhir tanpa iringan",
  ],
};

const SCENE_TRANSITIONS = [
  "Cut keras ke adegan berikutnya",
  "Whip pan cepat 0,3 detik",
  "Match cut lewat objek berwarna sama",
  "Dip 2 frame dengan flash putih tipis",
  "Crossfade singkat 0,4 detik",
];

/**
 * Lokasi adegan — `setting`, `ambient`, dan `lighting` dipasangkan supaya
 * konsisten (latar luar tidak mungkin dapat cahaya jendela dalam ruangan).
 */
const SCENE_LOCATIONS: { setting: string; ambient: string; lighting: string }[] = [
  {
    setting: "Ruang kerja minimallis — meja kayu, dinding polos, tanaman hias di sudut kanan",
    ambient: "Siang hari, cahaya alami lembut dari jendela samping, debu halus tampak melayang",
    lighting: "Key light lembut dari kiri 45°, rim light tipis di bahu, tanpa bayangan keras",
  },
  {
    setting: "Taman kota sore hari dengan pepohonan kabur di latar belakang",
    ambient: "Sore menjelang magrib, cahaya keemasan rendah, bayangan panjang",
    lighting: "Cahaya matahari rendah dari belakang samping, fill card di depan agar wajah tetap terbuka",
  },
  {
    setting: "Ruang tamu siang hari — sofa linen, jendela besar, buku terbuka di meja",
    ambient: "Pagi hari yang sepi, kesan segar dan baru mulai",
    lighting: "Cahaya praktis dari jendela, fill card di kanan untuk membuka bayangan",
  },
  {
    setting: "Meja kerja malam hari dengan berkas dan laptop terbuka",
    ambient: "Malam, pencahayaan praktis dari lampu meja, suasana fokus dan tenang",
    lighting: "Dua sumber: key hangat kiri, fill dingin kanan, memberi pemisahan subjek–latar",
  },
  {
    setting: "Lokasi terkait topik (pasar, kantor, jalanan) dengan latar sibuk tapi terkontrol",
    ambient: "Cuaca cerah dengan angin ringan, daun bergerak pelan di latar",
    lighting: "Cahaya siang alami, kontras sedang, bayangan tajam tapi tidak memotong wajah",
  },
  {
    setting: "Studio satu warna dengan satu objek properti sebagai pusat perhatian",
    ambient: "Ruang dalam yang tenang, tanpa gangguan, hampa suara terasa",
    lighting: "Backlight kuat dengan haze tipis sehingga siluet subjek menonjol",
  },
];

/** Palet warna dominan adegan. */
const SCENE_PALETTES = [
  "Putih hangat, hijau sage, aksen biru langit",
  "Abu gelap, amber hangat, putih tulang",
  "Biru tenang, teal, aksen kuning untuk penekanan angka",
  "Cokelat tanah, krem, aksen terracotta",
  "Hitam pekat, putih murni, satu aksen merah bata",
  "Hijau hutan, mint, putih bersih",
];

const SCENE_ON_SCREEN_TEXT = [
  "Judul besar bold 64px di sepertiga atas, putih dengan drop-shadow tipis",
  "Subtitle all-caps 32px di bawah tengah, di atas blok semi-transparan",
  "Angka raksasa 120px di sisi kanan dengan garis aksen 4px",
  "Lower-third bersih: label kecil 20px + judul 44px, sudut membulat",
  "Bullet muncul satu per satu, ikon garis 40px di kiri tiap baris",
];

/* ---------- Slide carousel ---------- */

const SLIDE_LAYOUTS: Record<SlideRole, string[]> = {
  hook: [
    "Hero teks penuh — judul besar tengah, satu aksen grafis di belakang",
    "Judul kiri 60%, ilustrasi kanan 40% sejajar baseline",
  ],
  masalah: [
    "Tiga kartu sejajar, tiap kartu satu masalah dengan ikon di atas",
    "Kutipan besar di tengah dengan tanda kutip dekoratif",
  ],
  data: [
    "Dua angka besar kiri–kanan dengan pembanding di bawahnya",
    "Satu grafik batang horizontal, teks penjelas di sepertiga bawah",
  ],
  tips: [
    "Daftar bernomor vertikal, nomor 01–04 dalam lingkaran aksen",
    "Dua kolom: langkah kiri, ilustrasi langkah kanan",
  ],
  bukti: [
    "Kartu testimoni — foto bundar kecil, nama, lalu kutipan",
    "Sebelum–sesudah dengan garis pemisah vertikal di tengah",
  ],
  cta: [
    "Ajakan di tengah dengan tombol ilustratif dan ikon panah",
    "Judul besar + baris akun/kanal di sepertiga bawah",
  ],
};

const SLIDE_COMPOSITIONS = [
  "Zig-zag baca: judul kiri atas → isi kanan bawah, garis aksen menghubungkan",
  "Sentral — satu elemen pusat, elemen lain mengelilingi dengan padding merata",
  "Grid 12 kolom, teks menempati 7 kolom, imagery 5 kolom",
  "Vertikal bertingkat: pita atas tipis, konten utama, pita bawah tipis",
  "Asimetris — blok teks besar di kiri, ruang kosong lapang di kanan",
];

const SLIDE_BACKGROUNDS = [
  "Gradien lembut dari putih ke abu sangat terang, tekstur kertas halus",
  "Warna solid gelap dengan lingkaran buram besar di dua sudut",
  "Gradien biru–teal diagonal, pola titik-titik opacity 8%",
  "Krem polos dengan garis kontur tipis di tepi kiri",
  "Foto latar sangat buram (blur 24px) + overlay putih 85%",
];

const SLIDE_IMAGERIES = [
  "Ilustrasi flat dua warna, garis tebal, tanpa gradasi",
  "Foto stok natural dengan crop ketat pada subjek",
  "Ikon garis 3px sejajar, ukuran seragam 48px",
  "Rekaman layar/mock produk dengan bingkai perangkat",
  "Blok warna geometris sebagai penekan visual, tanpa objek figuratif",
];

const SLIDE_SUBJECTS = [
  "Subjek utama menghadap ke arah teks agar alur baca mengikuti tatapannya",
  "Objek terkait topik dipotret dari atas, komposisi rapi, bayangan lembut",
  "Sosok setengah badan dengan pakaian kerja kasual, ekspresi tenang",
  "Tangan memegang objek, latar polos, fokus tajam pada objek",
  "Ilustrasi karakter tanpa wajah detail — fokus pada gestur dan properti",
];

const SLIDE_TYPOGRAPHIES = [
  "Judul 72px bold, subjudul 36px medium, body 28px regular, angka 120px black",
  "Judul 64px semibold all-caps, body 30px, tracking longgar 2%",
  "Judul 80px black dengan potongan baris disengaja, body 26px",
  "Dua tingkat saja: judul 68px dan label 24px — tanpa body panjang",
];

const SLIDE_PALETTES = [
  "Primer biru, aksen kuning, netral putih",
  "Hijau tua, mint, aksen krem",
  "Hitam, putih, satu aksen oranye terang",
  "Ungu tua, lilac, putih",
  "Teal, pasir, aksen merah bata",
];

const SLIDE_OVERLAYS = [
  "Badge nomor urut di kiri atas, sudut membulat, opacity 90%",
  "Garis aksen horizontal 6px di bawah judul",
  "Angka besar transparan (opacity 15%) di latar sebagai dekorasi",
  "Pita bawah berwarna solid untuk caption pendukung",
  "Titik navigasi 1/6 di kanan bawah untuk penanda posisi slide",
];

const SLIDE_TRANSITIONS = [
  "Geser ke kiri (push) 0,35 detik",
  "Morph elemen judul ke posisi slide berikutnya",
  "Crossfade cepat 0,25 detik",
  "Slide naik dengan bayangan mengikuti",
  "Wipe diagonal 0,3 detik",
];

/**
 * Peran slide yang dirotasi sesuai jumlah slide — selalu dibuka `hook`,
 * ditutup `cta`, dan peran tengah disebar merata agar tidak berkerumun.
 */
function slideRolesFor(count: number): SlideRole[] {
  if (count <= 1) return ["hook"];
  if (count === 2) return ["hook", "cta"];

  const middles: SlideRole[] = ["masalah", "data", "tips", "bukti"];
  const middleCount = count - 2;
  const roles: SlideRole[] = ["hook"];
  for (let i = 0; i < middleCount; i++) {
    // Slide lebih banyak dari jumlah peran → siklus, supaya tidak ada dua
    // peran identik berdampingan.
    const index =
      middleCount > middles.length
        ? i % middles.length
        : middleCount === 1
          ? 0
          : Math.round((i * (middles.length - 1)) / (middleCount - 1));
    roles.push(middles[index]);
  }
  roles.push("cta");
  return roles;
}

/** Judul & body per slide berdasarkan peran — `total` = jumlah slide. */
type SlideCopyFn = (topic: string, total: number) => string;

const SLIDE_COPY: Record<
  SlideRole,
  { headline: SlideCopyFn; body: SlideCopyFn; visual: SlideCopyFn }
> = {
  hook: {
    headline: (t, total) => `${t} dalam ${total} slide`,
    body: (t) => `Satu hal penting soal ${t} yang jarang dibahas.`,
    visual: (t, total) => `Hook: ${t} dalam ${total} slide`,
  },
  masalah: {
    headline: () => "Masalah yang sering diabaikan",
    body: () => "Tiga keluhan yang paling sering muncul dari pembaca dan praktisi di lapangan.",
    visual: () => "Masalah yang sering diabaikan",
  },
  data: {
    headline: (t) => `Angka kunci ${t}`,
    body: () => "Perbandingan dengan periode sebelumnya beserta sumber resminya.",
    visual: () => "Angka kunci dan sumbernya",
  },
  tips: {
    headline: () => "Langkah praktis",
    body: () => "Langkah bertahap yang bisa langsung dipraktikkan hari ini, berurutan dari termudah.",
    visual: () => "Langkah praktis bertahap",
  },
  bukti: {
    headline: () => "Bukti dari lapangan",
    body: () => "Contoh nyata dan kutipan singkat yang memperkuat argumen di slide sebelumnya.",
    visual: () => "Bukti dan kutipan nyata",
  },
  cta: {
    headline: () => "Simpan & bagikan",
    body: () => "Ikuti kanal untuk seri lanjutan, lalu bagikan ke satu orang yang membutuhkannya.",
    visual: () => "Simpan & bagikan",
  },
};

/* ---------- Image ---------- */

/** Brief visual tunggal untuk content-type image — 3 varian. */
const IMAGE_BRIEFS: ImageBrief[] = [
  {
    composition: "Judul menempati 55% kiri atas, grafik/angka di kanan bawah, garis aksen diagonal membelah keduanya",
    subject: "Objek utama terkait topik dipotret dekat, satu tangan menunjuk detail kunci, lengan berpakaian netral",
    background: "Gradien sangat lembut putih → biru sangat terang dengan tekstur kertas halus, tanpa elemen ramai",
    lighting: "Cahaya studio lembut dari atas-depan, bayangan jatuh pendek dan rendah kontras",
    palette: "Biru langit, putih hangat, aksen hijau untuk penekanan angka",
    typography: "Judul 84px bold, subjudul 34px medium, angka 140px black — semua sans-serif",
    negativeSpace: "Sisakan 20% ruang kosong di sepertiga bawah khusus untuk teks caption unggahan",
  },
  {
    composition: "Tiga kolom sejajar, tiap kolom satu ikon + angka, judul membentang penuh di atas",
    subject: "Tiga ikon garis 5px dengan bobot seragam, satu objek nyata sebagai penyeimbang di kolom tengah",
    background: "Warna solid netral dengan blok membulat opacity 8% di dua sudut",
    lighting: "Flat lighting seragam, tanpa bayangan keras — kesan infografik bersih",
    palette: "Abu gelap, putih tulang, satu aksen kuning untuk angka terpenting",
    typography: "Judul 72px semibold, label kolom 26px medium, angka 110px black",
    negativeSpace: "Padding 48px di seluruh sisi, hindari elemen masuk safe area platform",
  },
  {
    composition: "Potret subjek di kiri (45%), teks ringkas di kanan dengan rata kiri",
    subject: "Orang usia 25–40 tahun, pakaian kasual rapi, ekspresi tenang menatap sedikit ke arah teks",
    background: "Latar ruangan asli dengan blur 18px, warna dinding polos terang",
    lighting: "Cahaya jendela dari kiri, fill card kanan agar bayangan pipi terbuka",
    palette: "Netral hangat, hijau tanaman sebagai aksen alami, putih untuk teks",
    typography: "Judul 64px bold di dua baris, body pendek 28px, tag kecil 20px",
    negativeSpace: "Kosongkan 15% kanan atas untuk logo/watermark kanal",
  },
];

/* ---------- Perakit draf ---------- */

/** Jumlah adegan mengikuti durasi video (makin panjang, makin banyak adegan). */
function sceneCountFor(durationSec: number): number {
  if (durationSec >= 60) return 6;
  if (durationSec >= 45) return 5;
  return 4;
}

/** Peran adegan: pembuka hook, penutup cta, sisanya isi (berjenjang). */
function sceneRoleFor(index: number, count: number): SceneRole {
  if (index === 0) return "hook";
  if (index === count - 1) return "cta";
  return "isi";
}

/**
 * Ambil entri pool berdasarkan varian + offset.
 * Penjumlahan (bukan perkalian) supaya pool berukuran 3 sekalipun tetap
 * berputar penuh saat varian berubah.
 */
function pick<T>(pool: T[], variant: number, salt: number): T {
  return pool[(variant + salt) % pool.length];
}

function sceneBriefFor(role: SceneRole, variant: number, index: number): SceneBrief {
  const salt = variant + index;
  const framing = pick(SCENE_FRAMING[role], salt, 0);
  const location = pick(SCENE_LOCATIONS, salt, 2);
  return {
    shotAngle: framing.shotAngle,
    cameraMotion: pick(SCENE_MOTIONS[role], salt, 1),
    setting: location.setting,
    ambient: location.ambient,
    subject: framing.subject,
    lighting: location.lighting,
    palette: pick(SCENE_PALETTES, salt, 6),
    onScreenText: pick(SCENE_ON_SCREEN_TEXT, salt, 7),
    audio: pick(SCENE_AUDIO[role], salt, 8),
    transition: pick(SCENE_TRANSITIONS, salt, 9),
  };
}

function scenesFor(topic: string, durationSec: number, variant: number): SceneDraft[] {
  const count = sceneCountFor(durationSec);
  const per = Math.round(durationSec / count);
  let isiSeen = 0;

  return Array.from({ length: count }, (_, i) => {
    const role = sceneRoleFor(i, count);
    let visualText: string;
    let narration: string;

    if (role === "hook") {
      visualText = SCENE_HOOK_TEXTS[variant % SCENE_HOOK_TEXTS.length](topic);
      narration = SCENE_HOOK_NARRATIONS[variant % SCENE_HOOK_NARRATIONS.length](topic);
    } else if (role === "cta") {
      visualText = SCENE_CTA_TEXTS[variant % SCENE_CTA_TEXTS.length](topic);
      narration = SCENE_CTA_NARRATIONS[variant % SCENE_CTA_NARRATIONS.length](topic);
    } else {
      visualText = isiVisualText(topic, isiSeen, variant);
      narration = isiNarration(topic, isiSeen, variant);
      isiSeen += 1;
    }

    return {
      id: `scene-${i + 1}`,
      startSec: i * per,
      endSec: i === count - 1 ? durationSec : (i + 1) * per,
      role,
      media: `Mock render adegan ${i + 1}`,
      visualText,
      narration,
      visualBrief: sceneBriefFor(role, variant, i),
    };
  });
}

function slideBriefFor(role: SlideRole, variant: number, index: number): SlideBrief {
  const salt = variant + index;
  return {
    layout: pick(SLIDE_LAYOUTS[role], salt, 0),
    composition: pick(SLIDE_COMPOSITIONS, salt, 1),
    background: pick(SLIDE_BACKGROUNDS, salt, 2),
    imagery: pick(SLIDE_IMAGERIES, salt, 3),
    subject: pick(SLIDE_SUBJECTS, salt, 4),
    typography: pick(SLIDE_TYPOGRAPHIES, salt, 5),
    palette: pick(SLIDE_PALETTES, salt, 6),
    overlay: pick(SLIDE_OVERLAYS, salt, 7),
    transition: pick(SLIDE_TRANSITIONS, salt, 8),
  };
}

function slidesFor(topic: string, slideCount: number, variant: number): SlideDraft[] {
  const roles = slideRolesFor(slideCount);
  return roles.map((role, i) => ({
    id: `slide-${i + 1}`,
    media: `Mock render slide ${i + 1}`,
    role,
    headline: SLIDE_COPY[role].headline(topic, slideCount),
    bodyText: SLIDE_COPY[role].body(topic, slideCount),
    visualText: SLIDE_COPY[role].visual(topic, slideCount),
    visualBrief: slideBriefFor(role, variant, i),
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
    creativeDirection: creativeDirectionFor(topic, angle, variant),
    caption: captionFor(topic, angle, variant),
    scenes: scenesFor(topic, durationSec, variant),
    hashtags: hashtagsFor(topic, variant),
  };
}

function buildArticleDraft(
  topic: string,
  angle: string,
  variant: number
): ArticleDraft {
  return {
    headline: ARTICLE_HEADLINES[variant % ARTICLE_HEADLINES.length](topic),
    creativeDirection: creativeDirectionFor(topic, angle, variant),
    caption: captionFor(topic, angle, variant),
    outline: [...ARTICLE_OUTLINE_TEMPLATES[variant % ARTICLE_OUTLINE_TEMPLATES.length]],
    body: ARTICLE_BODY_VARIANTS[variant % ARTICLE_BODY_VARIANTS.length](topic, angle),
    hashtags: hashtagsFor(topic, variant),
  };
}

function buildImageDraft(
  topic: string,
  angle: string,
  variant: number
): ImageDraft {
  return {
    aspectRatio: IMAGE_ASPECTS[variant % IMAGE_ASPECTS.length],
    avatar: AVATARS[variant % AVATARS.length],
    media: "Mock render image",
    visualText: IMAGE_TEXTS[variant % IMAGE_TEXTS.length](topic),
    creativeDirection: creativeDirectionFor(topic, angle, variant),
    visualBrief: IMAGE_BRIEFS[variant % IMAGE_BRIEFS.length],
    caption: captionFor(topic, angle, variant),
    hashtags: hashtagsFor(topic, variant),
  };
}

function buildCarouselDraft(
  topic: string,
  angle: string,
  variant: number
): CarouselDraft {
  const slideCount = [5, 6, 7][variant % 3];
  return {
    slideCount,
    aspectRatio: CAROUSEL_ASPECTS[variant % CAROUSEL_ASPECTS.length],
    summary: CAROUSEL_SUMMARIES[variant % CAROUSEL_SUMMARIES.length](topic, angle),
    slides: slidesFor(topic, slideCount, variant),
    creativeDirection: creativeDirectionFor(topic, angle, variant),
    caption: captionFor(topic, angle, variant),
    hashtags: hashtagsFor(topic, variant),
  };
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

/**
 * Varian caption, hashtags, dan arah kreatif untuk regenerate per bagian.
 * Ketiganya ada di semua tipe konten, jadi ditangani satu fungsi generik.
 */
function varyCommonSections(
  draft: BriefData,
  section: BriefSectionKey,
  variant: number,
  topic: string,
  angle: string
): BriefData {
  if (section === "caption") {
    return {
      ...draft,
      data: {
        ...draft.data,
        caption: CAPTION_VARIANTS[variant % CAPTION_VARIANTS.length](topic, angle),
      },
    } as BriefData;
  }

  if (section === "hashtags") {
    return {
      ...draft,
      data: {
        ...draft.data,
        hashtags: HASHTAG_SETS[variant % HASHTAG_SETS.length](topic),
      },
    } as BriefData;
  }

  if (section === "creative") {
    return {
      ...draft,
      data: {
        ...draft.data,
        creativeDirection: creativeDirectionFor(topic, angle, variant),
      },
    } as BriefData;
  }

  return draft;
}

/**
 * Regenerate satu bagian brief. `topic` dan `angle` selalu diambil dari input
 * asli (bukan draf) supaya varian baru tidak menggandakan teks hasil template.
 */
function varySection(
  draft: BriefData,
  section: BriefSectionKey,
  variant: number,
  topic: string,
  angle: string
): BriefData {
  if (section === "caption" || section === "hashtags" || section === "creative") {
    return varyCommonSections(draft, section, variant, topic, angle);
  }
  switch (draft.contentType) {
    case "article": {
      const data = { ...draft.data };
      if (section === "headline") {
        data.headline = ARTICLE_HEADLINES[variant % ARTICLE_HEADLINES.length](topic);
      }
      if (section === "outline") {
        data.outline = [...ARTICLE_OUTLINE_TEMPLATES[variant % ARTICLE_OUTLINE_TEMPLATES.length]];
      }
      if (section === "body") {
        data.body = ARTICLE_BODY_VARIANTS[variant % ARTICLE_BODY_VARIANTS.length](
          topic,
          angle
        );
      }
      return { ...draft, data };
    }
    case "video": {
      if (section === "settings") {
        const next = buildVideoDraft(topic, angle, variant + 1);
        return {
          ...draft,
          data: {
            ...draft.data,
            durationSec: next.durationSec,
            aspectRatio: next.aspectRatio,
            avatar: next.avatar,
            scenes: scenesFor(topic, next.durationSec, variant),
          },
        };
      }
      if (section === "summary") {
        return {
          ...draft,
          data: {
            ...draft.data,
            summary: VIDEO_SUMMARIES[variant % VIDEO_SUMMARIES.length](topic, angle),
          },
        };
      }
      if (section === "scenes") {
        return {
          ...draft,
          data: { ...draft.data, scenes: scenesFor(topic, draft.data.durationSec, variant) },
        };
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
            visualText: IMAGE_TEXTS[variant % IMAGE_TEXTS.length](topic),
            visualBrief: IMAGE_BRIEFS[(variant + 1) % IMAGE_BRIEFS.length],
          },
        };
      }
      return draft;
    }
    case "carousel": {
      if (section === "settings") {
        const next = buildCarouselDraft(topic, angle, variant + 1);
        return {
          ...draft,
          data: {
            ...draft.data,
            slideCount: next.slideCount,
            aspectRatio: next.aspectRatio,
            slides: slidesFor(topic, next.slideCount, variant),
          },
        };
      }
      if (section === "summary") {
        return {
          ...draft,
          data: {
            ...draft.data,
            summary: CAROUSEL_SUMMARIES[variant % CAROUSEL_SUMMARIES.length](topic, angle),
          },
        };
      }
      if (section === "slides") {
        return {
          ...draft,
          data: { ...draft.data, slides: slidesFor(topic, draft.data.slideCount, variant) },
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
      draft = { contentType: "image", data: buildImageDraft(input.topic, angle, variant) };
      break;
    case "carousel":
      draft = { contentType: "carousel", data: buildCarouselDraft(input.topic, angle, variant) };
      break;
  }
  if (input.section) {
    draft = varySection(draft, input.section, variant, input.topic, angle);
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
    basis: angleBasis(input.topic, input.scenario, index, input),
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
