import type { IdeationService } from "@/types/ideation";
import { mockIdeationService } from "./mock/ideation";

/**
 * Registry layanan ideation Phase 2.
 * Prototipe mock-only; saat integrasi back end, tambahkan implementasi HTTP
 * dan pilih berdasarkan konfigurasi (pola sama dengan AnalyticsService).
 */
export function getIdeationService(): IdeationService {
  return mockIdeationService;
}
