import type { BriefProject } from "@/types/brief-project";
import { getDemoState } from "../demo-state";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Daftar proyek/brief untuk dashboard Workspace (mock).
 * Latensi disimulasi; state demo ?state=loading|empty|error dihormati
 * agar halaman punya state loading/empty/error (R27).
 */
export const MOCK_BRIEF_PROJECTS: BriefProject[] = [
  {
    id: "bp-01",
    topicTitle: "Harga Kebutuhan Pokok Naik jelang Akhir Tahun",
    angleTitle: "Fakta & angka terkini",
    contentType: "article",
    updatedAt: "2026-10-07",
    status: "published",
    scenario: "recommended",
  },
  {
    id: "bp-02",
    topicTitle: "Timnas Indonesia di Kualifikasi Pekan Ini",
    angleTitle: "Sudut pandang warga",
    contentType: "video",
    updatedAt: "2026-10-06",
    status: "review",
    scenario: "recommended",
  },
  {
    id: "bp-03",
    topicTitle: "Tips Produktivitas untuk Pekerja Remote",
    angleTitle: "Langkah praktis",
    contentType: "carousel",
    updatedAt: "2026-10-05",
    status: "draft",
    scenario: "custom",
  },
  {
    id: "bp-04",
    topicTitle: "Mitos vs Fakta Vaksinasi Musim Hujan",
    angleTitle: "Mitos vs fakta",
    contentType: "image",
    updatedAt: "2026-10-03",
    status: "review",
    scenario: "recommended",
  },
  {
    id: "bp-05",
    topicTitle: "Gadget Terbaru yang Rilis Bulan Ini",
    angleTitle: "Fakta & angka terkini",
    contentType: "article",
    updatedAt: "2026-10-01",
    status: "draft",
    scenario: "custom",
  },
  {
    id: "bp-06",
    topicTitle: "Kalender Acara Pekan Ini",
    angleTitle: "Langkah praktis",
    contentType: "video",
    updatedAt: "2026-09-28",
    status: "published",
    scenario: "recommended",
  },
];

export async function listBriefProjects(): Promise<BriefProject[]> {
  const state = getDemoState();
  if (state === "loading") return new Promise<never>(() => {});
  await sleep(500 + Math.random() * 400);
  if (state === "error") {
    throw new Error("Gagal memuat daftar proyek. Silakan coba lagi.");
  }
  if (state === "empty") return [];
  return MOCK_BRIEF_PROJECTS;
}
