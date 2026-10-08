/**
 * Opsi tagging untuk filter Data Platform (Overview).
 * Sementara mock — kontrak final menyusul dari BE.
 */
export const TAGGING_OPTIONS = [
  "Nasional",
  "Politik",
  "Ekonomi",
  "Hiburan",
  "Olahraga",
  "Gaya Hidup",
] as const;

/** Nilai query bila filter tagging tidak aktif. */
export const TAGGING_ALL = "all";
