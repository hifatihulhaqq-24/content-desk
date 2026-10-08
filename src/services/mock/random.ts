/** PRNG deterministik berbasis FNV-1a — data mock stabil antar render. */

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Hash acak deterministik dalam [0, 1) dari gabungan bagian kunci. */
export function rand01(...parts: (string | number)[]): number {
  return hashString(parts.join("|")) / 4294967296;
}

export function randRange(
  min: number,
  max: number,
  ...parts: (string | number)[]
): number {
  return min + rand01(...parts) * (max - min);
}

export function randInt(
  min: number,
  max: number,
  ...parts: (string | number)[]
): number {
  return Math.floor(randRange(min, max + 1, ...parts));
}

/** Noise mirip distribusi normal (jumlah 3 uniform − 1.5, dinormalisasi). */
export function gauss(...parts: (string | number)[]): number {
  const sum =
    rand01(...parts, 1) + rand01(...parts, 2) + rand01(...parts, 3);
  return (sum - 1.5) / 0.7071;
}

export function pick<T>(items: readonly T[], ...parts: (string | number)[]): T {
  return items[randInt(0, items.length - 1, ...parts)];
}

/** Pilih kunci dari tabel bobot (deterministik). */
export function weightedKey<T extends string>(
  weights: Record<T, number>,
  ...parts: (string | number)[]
): T {
  const keys = Object.keys(weights) as T[];
  const total = keys.reduce((sum, key) => sum + weights[key], 0);
  let roll = rand01(...parts) * total;
  for (const key of keys) {
    roll -= weights[key];
    if (roll < 0) return key;
  }
  return keys[keys.length - 1];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** ISO yyyy-MM-dd → indeks hari (timezone-independent). */
export function isoToDayIndex(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

export function dayIndexToIso(index: number): string {
  const date = new Date(index * 86400000);
  return date.toISOString().slice(0, 10);
}

export function isoWeekday(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
