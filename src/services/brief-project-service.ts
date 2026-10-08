import type { BriefProjectService } from "@/types/brief-project";
import { listBriefProjects } from "./mock/brief-projects";

/**
 * Registry layanan proyek/brief (dashboard Workspace).
 * Prototipe mock-only; saat integrasi back end, tambahkan implementasi HTTP
 * dan pilih berdasarkan konfigurasi (pola sama dengan IdeationService).
 */
export function getBriefProjectService(): BriefProjectService {
  return { listBriefProjects };
}
