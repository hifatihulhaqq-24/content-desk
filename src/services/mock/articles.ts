import type { ArticleSummary } from "@/types/analytics";
import { addDays } from "date-fns";
import { today, toIsoDate } from "@/lib/date";
import { randRange } from "./random";

const ARTICLE_TITLES = [
  "Prabowo Resmikan Infrastruktur Baru di Kawasan Timur",
  "IHSG Ditutup Menguat, Saham Perbankan Jadi Penopang",
  "Timnas Indonesia Bhayangkara FC Tampil Dominan Pekan Ini",
  "Riset: Konsumen Indonesia Semakin Gemar Belanja Online",
  "Tips Menata Rumah Mungil Agar Terasa Lapang",
  "Bursa Transfer: Klab Liga 1 Incar Gelandang Asing",
  "Belajar dari Rumah: Strategi Ortu Dampingi Anak",
  "Rekomendasi Film Keluarga untuk Akhir Pekan",
  "Kurs Rupiah Stabil Di tengah Ketidakpastian Global",
  "Resep Soto Betawi Praktis untuk Makan Siang",
  "Pemerintah Pacu Ekspor Produk Olahan Kelapa",
  "Deretan Mobil Listrik Termurah di Pasaran Tanah Air",
  "Waspadai Tanda Awal Diabetes Sejak Dini",
  "Gaya Hidup Sehat ala Selebriti Tanah Air",
  "Fakta Menarik di Balik Kemenangan Timnas Putri",
  "Cara Mudah Merawat Kulit Wajah Selama Musim Hujan",
  "Startup Lokal Raih Pendanaan Seri A Senilai Triliunan",
  "Kalender Event Musik Jakarta Bulan Ini",
  "Panduan Lengkap Memilih Asuransi Kesehatan Keluarga",
  "Potret Keseharian Pemain Timnas di Skuad Garuda",
  "Harga Emas Antam Kembali Naik Pekan Ini",
  "Strategi UMKM Naik Kelas lewat Pemasaran Digital",
  "Inilah Kota dengan Kualitas Udara Terbaik di Asia",
  "Menu Sarapan Tinggi Protein untuk Anak Sekolah",
  "Teknik Dasar Pernapasan untuk Pemula",
  "Skuad Garuda Fokus Persiapan Laga Kualifikasi",
  "Sinetron Papan Atas Bertahan di Tangga Rating",
  "Ini Cara Kerja Sistem Cerdas di Balik Aplikasi Favoritmu",
];

let cache: ArticleSummary[] | null = null;

function buildArticles(): ArticleSummary[] {
  if (cache) return cache;
  const todayDate = today();
  cache = ARTICLE_TITLES.map((title, i) => {
    const dayOffset = i % 14;
    const date = toIsoDate(addDays(todayDate, -dayOffset));
    const pv = Math.round(randRange(2_500, 210_000, title, "pv"));
    const impressions = Math.round(pv * randRange(1.4, 2.6, title, "im"));
    const engagementRate =
      Math.round(randRange(0.02, 0.095, title, "er") * 1000) / 10;
    return {
      id: `article-${i + 1}`,
      title,
      publishedAt: date,
      pv,
      impressions,
      engagementRate,
    };
  });
  return cache;
}

export function topArticlesInRange(
  fromIso: string,
  toIso: string,
  limit = 5
): ArticleSummary[] {
  return buildArticles()
    .filter((article) => article.publishedAt >= fromIso && article.publishedAt <= toIso)
    .sort((a, b) => b.pv - a.pv)
    .slice(0, limit);
}
