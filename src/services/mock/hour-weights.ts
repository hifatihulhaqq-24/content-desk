import type { PlatformId } from "@/config/platforms";
import { rand01 } from "./random";

/**
 * Bobot dasar jam posting (WIB) untuk market Indonesia.
 * Semua nilai > 0 agar setiap jam selalu punya konten pada mock —
 * tiga puncak trending yang natural: pagi (08), sore (16), dan malam (20).
 */
const BASE_HOUR_WEIGHTS = [
  0.01, 0.005, 0.004, 0.003, 0.004, 0.008, // 00–05
  0.028, 0.055, 0.095, 0.05, 0.042, 0.048, // 06–11 (puncak 08)
  0.055, 0.05, 0.044, 0.052, 0.088, 0.058, // 12–17 (puncak 16)
  0.058, 0.066, 0.097, 0.06, 0.038, 0.022, // 18–23 (puncak 20)
];

/** Pengali jam khas perilaku tiap platform. */
function platformMultiplier(platform: PlatformId, hour: number): number {
  switch (platform) {
    case "instagram":
      if (hour >= 11 && hour <= 13) return 1.25;
      if (hour >= 18 && hour <= 20) return 1.2;
      if (hour >= 9 && hour <= 16) return 1.05;
      if (hour <= 5) return 0.8;
      return 1;
    case "tiktok":
      if (hour >= 19 && hour <= 23) return 1.45;
      if (hour >= 6 && hour <= 8) return 1.2;
      if (hour >= 10 && hour <= 16) return 0.75;
      if (hour >= 1 && hour <= 4) return 1.15;
      return 1;
    case "youtube":
      if (hour >= 16 && hour <= 21) return 1.35;
      if (hour >= 12 && hour <= 15) return 1.1;
      if (hour <= 6) return 0.7;
      return 1;
    case "facebook":
      if (hour >= 7 && hour <= 10) return 1.35;
      if (hour === 12 || hour === 13) return 1.2;
      if (hour >= 19 && hour <= 20) return 1.15;
      if (hour <= 5) return 0.75;
      return 1;
    default:
      return 1;
  }
}

function normalize(values: number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 1 / values.length);
  return values.map((value) => value / total);
}

/**
 * Pengali performa (tayangan/interaksi per konten) per jam.
 * Konten yang terbit larut malam performanya lebih rendah,
 * puncaknya menyesuaikan jam trending: 08, 16, dan 20.
 */
export function hourPerformance(hour: number): number {
  const table = [
    0.85, 0.7, 0.6, 0.55, 0.6, 0.7, // 00–05
    0.9, 1.05, 1.25, 1.0, 0.95, 1.05, // 06–11 (puncak 08)
    1.15, 1.1, 0.95, 0.9, 1.2, 1.1, // 12–17 (puncak 16)
    1.2, 1.35, 1.45, 1.3, 1.0, 0.9, // 18–23 (puncak 20)
  ];
  return table[hour] ?? 1;
}

const accountWeightsCache = new Map<string, number[]>();

/** Bobot jam untuk satu akun: bentuk platform + jitter deterministik ±15%. */
export function accountHourWeights(
  accountId: string,
  platform: PlatformId
): number[] {
  const key = `${accountId}|${platform}`;
  const cached = accountWeightsCache.get(key);
  if (cached) return cached;

  const weights = BASE_HOUR_WEIGHTS.map((weight, hour) => {
    const jitter = 0.85 + rand01(accountId, hour, "hw") * 0.3;
    return weight * platformMultiplier(platform, hour) * jitter;
  });
  const normalized = normalize(weights);
  accountWeightsCache.set(key, normalized);
  return normalized;
}

/** Pilih jam (0–23) secara deterministik mengikuti bobot sebuah akun. */
export function pickHour(
  accountId: string,
  platform: PlatformId,
  ...parts: (string | number)[]
): number {
  const weights = accountHourWeights(accountId, platform);
  const roll = rand01(accountId, ...parts, "hour");
  let cursor = 0;
  for (let hour = 0; hour < weights.length; hour++) {
    cursor += weights[hour];
    if (roll < cursor) return hour;
  }
  return weights.length - 1;
}
