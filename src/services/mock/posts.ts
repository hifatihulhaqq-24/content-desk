import { addDays } from "date-fns";
import type { BuildingBlockId, ContentFormat, Post } from "@/types/analytics";
import { CLUSTERS } from "@/config/clusters";
import { TAGGING_OPTIONS } from "@/config/tagging";
import { findAccount, type PlatformId } from "@/config/platforms";
import { today, toIsoDate } from "@/lib/date";
import { dailyAt } from "./series";
import { pick, rand01, randInt, randRange, weightedKey } from "./random";
import { pickHour } from "./hour-weights";

const POST_WINDOW_DAYS = 180;
/** Probabilitas akun menerbitkan konten kedua pada hari yang sama. */
const SECOND_POST_PROBABILITY = 0.3;

/**
 * Format analitik per tipe konten platform — persis kategori Content Type
 * Analysis di mock kumparanDesk — PRODUCT MVP (5 tipe utama + Lainnya).
 * Format diturunkan dari platform + tipe agar analisis post, Content Type
 * Analysis, dan filter tipe selalu konsisten (A11).
 */
function formatOfType(type: string, platform: PlatformId): ContentFormat {
  if (platform === "tiktok" && type === "Video Pendek") return "TikTok Video";
  if (platform === "youtube" && type === "Video")
    return "YouTube Full Video";
  if (platform === "instagram" && type === "Reels")
    return "Instagram Reels Video";
  if (platform === "facebook" && type === "Video") return "Facebook Video";
  if (platform === "facebook" && type === "Link") return "Facebook Link";
  return "Lainnya";
}

/**
 * Bobot building block per platform (10 block, mock kumparanDesk —
 * PRODUCT MVP). Block CAROUSEL ≡ tipe Carousel: pada post tipe Carousel,
 * building block selalu "carousel"; pada tipe lain, bobot "carousel"
 * dihilangkan (dinosialisasi ulang).
 */
function blockWeights(
  platform: PlatformId,
  type: string
): Record<BuildingBlockId, number> {
  const weights = { ...BLOCK_WEIGHTS[platform] };
  (Object.keys(weights) as BuildingBlockId[]).forEach((key) => {
    const allowed = type === "Carousel" ? key === "carousel" : key !== "carousel";
    if (!allowed) weights[key] = 0;
  });
  return weights;
}

const BLOCK_WEIGHTS: Record<PlatformId, Record<BuildingBlockId, number>> = {
  instagram: {
    svt: 15,
    svl: 15,
    onliner: 20,
    carousel: 35,
    vidol: 15,
    infografis: 9,
    explainer: 7,
    liveReport: 4,
    quote: 6,
    polling: 3,
  },
  tiktok: {
    svt: 30,
    svl: 25,
    onliner: 10,
    carousel: 15,
    vidol: 20,
    infografis: 6,
    explainer: 5,
    liveReport: 6,
    quote: 4,
    polling: 3,
  },
  youtube: {
    svt: 20,
    svl: 25,
    onliner: 10,
    carousel: 5,
    vidol: 40,
    infografis: 8,
    explainer: 10,
    liveReport: 4,
    quote: 5,
    polling: 3,
  },
  facebook: {
    svt: 15,
    svl: 20,
    onliner: 30,
    carousel: 20,
    vidol: 15,
    infografis: 12,
    explainer: 7,
    liveReport: 5,
    quote: 6,
    polling: 4,
  },
  x: {
    svt: 15,
    svl: 30,
    onliner: 30,
    carousel: 10,
    vidol: 15,
    infografis: 7,
    explainer: 5,
    liveReport: 4,
    quote: 7,
    polling: 5,
  },
};

const CAPTIONS = [
  "Awali pagi dengan secangkir kopi favoritmu. Sudah ngopi hari ini?",
  "Behind the scenes minggu ini. Mana yang paling kamu suka?",
  "Promo spesial akhir pekan — cek link di bio.",
  "Tips singkat biar kontenmu lebih engaging. Simak sampai habis.",
  "Cerita pelanggan kami minggu ini. Terima kasih sudah percaya.",
  "Baru rilis! Coba dan beri tahu kami pendapatmu.",
  "Tiga hal yang wajib kamu tahu sebelum membeli.",
  "Konten favorit tim minggu ini. Pilihanmu sama?",
  "Tebak jawabannya di kolom komentar, hadiah menanti.",
  "Workshop gratis bulan depan. Daftarkan dirimu sekarang.",
  "Solusi praktis untuk masalah sehari-hari.",
  "Rekap performa bulan lalu dan pelajaran yang kami dapat.",
  "Jawaban untuk pertanyaan yang paling sering masuk.",
  "Produk unggulan yang paling banyak dicari bulan ini.",
  "Wawancara singkat bersama tim di balik layar.",
  "Panduan lengkap versi ringkas untuk pemula.",
];

const postCache = new Map<string, Post[]>();

export function postsForAccount(accountId: string): Post[] {
  const cached = postCache.get(accountId);
  if (cached) return cached;

  const found = findAccount(accountId);
  if (!found) return [];
  const { platform } = found;
  const todayDate = today();

  const posts: Post[] = [];
  let index = 0;

  for (let dayOffset = 0; dayOffset < POST_WINDOW_DAYS; dayOffset += 1) {
    const date = toIsoDate(addDays(todayDate, -dayOffset));
    const perDay =
      rand01(accountId, dayOffset, "extra") < SECOND_POST_PROBABILITY ? 2 : 1;

    for (let variant = 0; variant < perDay; variant += 1) {
      const i = index;
      const hour = pickHour(accountId, platform.id, accountId, i, variant);
      const minute = randInt(0, 59, accountId, i, "m");
      const type = pick(platform.contentTypes, accountId, i, "t");
      const format = formatOfType(type, platform.id);
      const buildingBlock = weightedKey(
        blockWeights(platform.id, type),
        accountId,
        i,
        "bb"
      );
      const tagging = pick(TAGGING_OPTIONS, accountId, i, "tag");
      const daily = dailyAt(accountId, date);
      const quality = randRange(0.35, 3.4, accountId, i, "q");
      const reach = Math.max(50, Math.round(daily.reach * quality * 0.4));
      const engagementRate = randRange(0.015, 0.13, accountId, i, "er");
      const engagement = Math.round(reach * engagementRate);
      const views = Math.round(reach * randRange(1.2, 3.2, accountId, i, "v"));
      const newFollowers = Math.max(
        1,
        Math.round(views * randRange(0.001, 0.012, accountId, i, "nf"))
      );
      const likes = Math.round(
        engagement * randRange(0.6, 0.76, accountId, i, "l")
      );
      const comments = Math.round(
        engagement * randRange(0.05, 0.12, accountId, i, "c")
      );
      const shares = Math.round(
        engagement * randRange(0.06, 0.14, accountId, i, "s")
      );
      const saves = Math.max(0, engagement - likes - comments - shares);

      posts.push({
        id: `${accountId}-p${i + 1}`,
        accountId,
        platform: platform.id,
        cluster: pick(CLUSTERS, accountId, i, "cl"),
        type,
        format,
        buildingBlock,
        tagging,
        caption: pick(CAPTIONS, accountId, i, "cap"),
        publishedAt: `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
        metrics: {
          likes,
          comments,
          shares,
          saves,
          reach,
          impressions: Math.round(
            reach * randRange(1.2, 2.1, accountId, i, "im")
          ),
          engagementRate: Math.round(engagementRate * 1000) / 10,
          views,
          newFollowers,
        },
      });
      index += 1;
    }
  }

  posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  postCache.set(accountId, posts);
  return posts;
}

export function postsInRange(
  accountIds: string[],
  fromIso: string,
  toIso: string
): Post[] {
  const result: Post[] = [];
  for (const id of accountIds) {
    for (const post of postsForAccount(id)) {
      const day = post.publishedAt.slice(0, 10);
      if (day >= fromIso && day <= toIso) result.push(post);
    }
  }
  return result;
}
