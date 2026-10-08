/**
 * Instrumentasi event flow (R31) — mock/log untuk usability test.
 * Menyimpan waktu per step dan total time-to-brief di memori sesi;
 * bisa dibaca via console (dev) atau diambil pemanggil untuk analisis.
 */

export interface FlowEvent {
  name: string;
  /** Epoch ms. */
  at: number;
  meta?: Record<string, string | number>;
}

const events: FlowEvent[] = [];

export function trackFlowEvent(
  name: string,
  meta?: Record<string, string | number>
): void {
  events.push({ name, at: Date.now(), meta });
  if (process.env.NODE_ENV !== "production") {
    console.debug("[flow]", name, meta ?? "");
  }
}

export function getFlowEvents(): FlowEvent[] {
  return [...events];
}

export function resetFlowEvents(): void {
  events.length = 0;
}
