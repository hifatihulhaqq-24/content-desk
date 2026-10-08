/**
 * Thumbnail mock di /public/mock — dipakai Overview (Content Buckets)
 * dan kartu rekomendasi topik. Hash string → path, deterministik.
 */
const BUCKET_IMAGES = [
  "/mock/bucket-01.jpg",
  "/mock/bucket-02.jpg",
  "/mock/bucket-03.jpg",
  "/mock/bucket-04.jpg",
  "/mock/bucket-05.jpg",
  "/mock/bucket-06.jpg",
  "/mock/bucket-07.jpg",
  "/mock/bucket-08.jpg",
  "/mock/bucket-09.jpg",
  "/mock/bucket-10.jpg",
  "/mock/bucket-11.jpg",
  "/mock/bucket-12.jpg",
];

/** Pilih thumbnail berdasarkan key (id post/topik) — selalu konsisten. */
export function bucketImageFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return BUCKET_IMAGES[hash % BUCKET_IMAGES.length];
}
