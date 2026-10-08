import type { InternalAssetItem } from "@/types/ideation";

/**
 * Aset internal DAM perusahaan (R8 — skenario "belum punya materi").
 * Thumbnail memakai aset lokal /mock agar demo deterministik dan offline.
 */
export const MOCK_INTERNAL_ASSETS: InternalAssetItem[] = [
  {
    id: "dam-01",
    title: "Infografis Data Finansial Q3 2026",
    type: "image",
    thumbnailUrl: "/mock/bucket-01.jpg",
    resolution: "1920×1080",
    matchScore: 94,
    tags: ["finansial", "infografis", "data"],
    sourceDate: "2026-09-15",
  },
  {
    id: "dam-02",
    title: "Video B-roll Wawancara Narasumber",
    type: "video",
    thumbnailUrl: "/mock/bucket-02.jpg",
    resolution: "3840×2160",
    matchScore: 91,
    tags: ["wawancara", "video", "narasumber"],
    sourceDate: "2026-09-02",
  },
  {
    id: "dam-03",
    title: "Foto Kantor & Suasana Kerja",
    type: "image",
    thumbnailUrl: "/mock/bucket-03.jpg",
    resolution: "2400×1600",
    matchScore: 87,
    tags: ["foto", "kantor", "profesional"],
    sourceDate: "2026-08-28",
  },
  {
    id: "dam-04",
    title: "Ilustrasi Grafik Tren Pencarian",
    type: "image",
    thumbnailUrl: "/mock/bucket-04.jpg",
    resolution: "1600×900",
    matchScore: 85,
    tags: ["tren", "grafik", "data"],
    sourceDate: "2026-09-20",
  },
  {
    id: "dam-05",
    title: "Video Pendukung Aktivitas Harian",
    type: "video",
    thumbnailUrl: "/mock/bucket-05.jpg",
    resolution: "1920×1080",
    matchScore: 82,
    tags: ["video", "gaya-hidup", "b-roll"],
    sourceDate: "2026-08-11",
  },
  {
    id: "dam-06",
    title: "Foto Produk Katalog Lama",
    type: "image",
    thumbnailUrl: "/mock/bucket-06.jpg",
    resolution: "2000×2000",
    matchScore: 78,
    tags: ["foto", "produk", "katalog"],
    sourceDate: "2026-07-30",
  },
  {
    id: "dam-07",
    title: "Infografis Ringkasan Survei Pembaca",
    type: "image",
    thumbnailUrl: "/mock/bucket-07.jpg",
    resolution: "1920×1080",
    matchScore: 74,
    tags: ["survei", "infografis", "data"],
    sourceDate: "2026-08-05",
  },
  {
    id: "dam-08",
    title: "Video Cuplikan Kompetisi Olahraga",
    type: "video",
    thumbnailUrl: "/mock/bucket-08.jpg",
    resolution: "3840×2160",
    matchScore: 71,
    tags: ["video", "olahraga", "cuplikan"],
    sourceDate: "2026-09-25",
  },
];

/** Daftar kategori untuk filter (tag paling umum). */
export const INTERNAL_ASSET_CATEGORIES = [
  "infografis",
  "foto",
  "video",
  "data",
  "produk",
] as const;
