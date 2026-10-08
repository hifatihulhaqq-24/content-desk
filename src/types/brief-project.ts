import type { ContentTypeId, EntryScenario } from "./ideation";

/** Status sebuah proyek/brief di dashboard Workspace. */
export type BriefProjectStatus = "draft" | "review" | "published";

/** Baris proyek konten pada daftar "Konten Brief". */
export interface BriefProject {
  id: string;
  topicTitle: string;
  angleTitle: string;
  contentType: ContentTypeId;
  /** Tanggal terakhir diperbarui (ISO yyyy-MM-dd). */
  updatedAt: string;
  status: BriefProjectStatus;
  scenario: EntryScenario;
}

export interface BriefProjectService {
  listBriefProjects(): Promise<BriefProject[]>;
}
