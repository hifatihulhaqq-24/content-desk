import type { TopicRecommendation } from "@/types/analytics";
import type { ClusterId } from "@/config/clusters";
import { randRange } from "./random";

type TopicSeed = [title: string, contentCount: number, score: number];

const VIEWS_PER_CONTENT_MIN = 80;
const VIEWS_PER_CONTENT_MAX = 520;

/** Total tayangan topik — deterministik dari jumlah konten (mock). */
function topicViews(title: string, contentCount: number): number {
  const perContent = Math.round(
    randRange(
      VIEWS_PER_CONTENT_MIN,
      VIEWS_PER_CONTENT_MAX,
      "topic-views",
      title
    )
  );
  return contentCount * perContent;
}

const DEFAULT_TOPICS: TopicSeed[] = [
  ["Nasional & Politik Terkini", 128, 94],
  ["Jadwal Timnas & Liga 1", 96, 88],
  ["Berita Viral Hari Ini", 71, 85],
  ["Kesehatan Keluarga", 74, 82],
  ["Rekomendasi Tempat Makan", 58, 76],
  ["Gadget & Teknologi", 54, 75],
  ["Update Gaya Hidup", 65, 77],
  ["Tips Produktivitas", 49, 73],
  ["Kalender Acara Pekan Ini", 46, 72],
  ["Info Diskon & Promo", 52, 71],
  ["Beasiswa & Pendidikan", 44, 71],
  ["Rumah & Dekorasi", 42, 70],
  ["Cara Hemat Pengeluaran", 39, 69],
  ["Cuaca & Prakiraan", 35, 67],
  ["Kalender Libur Nasional", 32, 66],
];

const TOPICS_BY_CLUSTER: Record<ClusterId, TopicSeed[]> = {
  News: [
    ["Agenda Pemerintah Pekan Ini", 86, 96],
    ["Koalisi & Manuver Parlemen", 71, 90],
    ["Kasus Korupsi Nasional", 64, 85],
    ["Harga Kebutuhan Pokok", 57, 82],
    ["Dinamika Partai Politik", 49, 79],
    ["Kebijakan Baru di Daerah", 48, 78],
    ["Banjir & Bencana Alam", 45, 76],
    ["Guru & Dunia Pendidikan", 44, 75],
    ["Pilkada Serentak", 42, 73],
    ["Anggaran Negara", 38, 71],
    ["Perppu & RUU Terbaru", 39, 70],
    ["Hubungan Indonesia–China", 36, 69],
    ["Putusan Mahkamah Agung", 34, 68],
    ["Isu Kerja Sama ASEAN", 31, 66],
    ["Pengumuman Resmi Pemerintah", 29, 64],
  ],
  Bisnis: [
    ["Rupiah & Pasar Modal", 78, 95],
    ["Gelombang Startup Lokal", 61, 89],
    ["Harga BBM & Kebijakan Energi", 55, 84],
    ["Saham Emiten Teknologi", 52, 81],
    ["Ekspor Komoditas Indonesia", 47, 79],
    ["Properti & Suku Bunga", 46, 77],
    ["Gaji & Pasar Kerja", 43, 76],
    ["Fintech & Pembayaran Digital", 41, 75],
    ["UMKM Naik Kelas", 39, 74],
    ["Emas & Instrumen Investasi", 38, 72],
    ["Ritel & Konsumsi Publik", 37, 73],
    ["Perang Dagang Global", 35, 70],
    ["Kinerja BUMN", 33, 69],
    ["Startup Pendanaan Seri A", 27, 65],
    ["Utang Luar Negeri", 26, 63],
  ],
  "Bola & Sport": [
    ["Timnas Indonesia", 92, 97],
    ["Bursa Transfer Liga 1", 68, 91],
    ["Liga Inggris Pekan Ini", 63, 86],
    ["Bulutangkis Indonesia", 54, 83],
    ["MotoGP & Formula 1", 51, 80],
    ["Jadwal & Hasil Liga 2", 45, 78],
    ["Piala Dunia Antarklub", 44, 77],
    ["Klasemen & Statistik", 40, 75],
    ["Prestasi Atlet Muda", 36, 72],
    ["Esports Indonesia", 34, 71],
    ["Sepak Bola Putri", 32, 70],
    ["Basket & NBA", 30, 68],
    ["PON & Multi Event", 28, 67],
    ["Atletik & Lari", 25, 64],
    ["Renang Nasional", 23, 62],
  ],
  Bolanita: [
    ["Timnas Putri Indonesia", 58, 95],
    ["Liga Putri Asia Tenggara", 41, 87],
    ["Prestasi Atlet Wanita", 37, 82],
    ["Tokoh Wanita Inspiratif", 33, 76],
    ["Sepak Bola Wanita Indonesia", 30, 74],
    ["Turnamen Bulutangkis Putri", 28, 71],
    ["Voli Putri Nusantara", 26, 68],
    ["Bulu Tangkis Tunggal Putri", 31, 72],
    ["Atletik Putri Asia", 24, 66],
    ["Pencapaian Olimpiade Putri", 21, 65],
    ["Renang Putri", 20, 63],
    ["Basket Putri Indonesia", 19, 62],
    ["Profil Pelatih Wanita", 18, 61],
    ["Futsal Wanita", 17, 60],
    ["Karier Atlet Pasca-Pensiun", 22, 64],
  ],
  Entertainment: [
    ["Konser & Festival Musik", 84, 94],
    ["Film Box Office Lokal", 66, 88],
    ["Kehidupan Artis Tanah Air", 59, 83],
    ["Drama Korea Terbaru", 47, 79],
    ["Lagu Viral TikTok", 49, 80],
    ["Serial Streaming Viral", 45, 78],
    ["Musik Dangdut & Koplo", 42, 76],
    ["Potret Kehidupan Seleb", 40, 75],
    ["Musik K-Pop & Idol", 38, 73],
    ["Komedi & Stand-up", 36, 72],
    ["Sinetron & TV Nasional", 34, 71],
    ["Festival Film Indonesia", 30, 69],
    ["Musik Indie & Band Lokal", 27, 67],
    ["Awards & Penghargaan", 25, 65],
    ["Teater & Pertunjukan", 21, 64],
  ],
  Mom: [
    ["ASI & MPASI", 73, 93],
    ["Tumbuh Kembang Balita", 62, 87],
    ["Kesehatan Ibu Hamil", 51, 82],
    ["Imunisasi & Vaksin", 43, 77],
    ["Parenting Positif", 44, 78],
    ["Rutinitas Harian Bayi", 39, 75],
    ["Aktivitas Edukatif Anak", 34, 72],
    ["Milestone Pertama Anak", 36, 73],
    ["Resep Makanan Anak", 35, 72],
    ["MPASI 6 Bulan", 33, 71],
    ["Perlengkapan Bayi", 31, 70],
    ["ASI Eksklusif", 30, 69],
    ["Makanan Bergizi Keluarga", 29, 67],
    ["Gangguan Tidur Anak", 28, 68],
    ["Kesehatan Mental Ibu", 26, 66],
  ],
  Woman: [
    ["Karier & Keuangan Wanita", 64, 92],
    ["Kesehatan Reproduksi", 53, 86],
    ["Fashion & Gaya Hidup", 49, 81],
    ["Skincare & Perawatan", 41, 77],
    ["Kuliner & Tempat Nongkrong", 39, 75],
    ["Makeup Harian", 37, 74],
    ["Work-life Balance", 35, 73],
    ["Wisata & Liburan", 36, 72],
    ["Cerita Inspiratif Wanita", 32, 71],
    ["Relasi & Keluarga", 30, 69],
    ["Busana Muslim Modern", 29, 68],
    ["Gaya Rambut Terkini", 27, 67],
    ["Kesehatan Mental Wanita", 25, 66],
    ["Olahraga Ringan Wanita", 24, 65],
    ["Hiburan Akhir Pekan", 28, 66],
  ],
  Otomotif: [
    ["Mobil Listrik di Indonesia", 76, 95],
    ["Promo & Kredit Mobil", 58, 89],
    ["Tips Perawatan Motor", 47, 84],
    ["Balap Formula & MotoGP", 43, 79],
    ["Review Mobil Terbaru", 45, 80],
    ["Modifikasi Motor", 36, 75],
    ["Perbandingan SUV", 38, 76],
    ["Mobil Bekas Murah", 34, 74],
    ["Mobil Keluarga 7 Penumpang", 33, 73],
    ["Pajak & Balik Nama", 31, 71],
    ["Bensin & Efisiensi BBM", 29, 69],
    ["Aksesori & Perlengkapan", 26, 67],
    ["Layanan Bengkel Resmi", 24, 65],
    ["Iuran & Asuransi Kendaraan", 25, 64],
    ["Parkir & Lalu Lintas", 22, 63],
  ],
};

export function topicsForCluster(cluster?: string): TopicRecommendation[] {
  const rows =
    cluster && cluster !== "all" && TOPICS_BY_CLUSTER[cluster as ClusterId]
      ? TOPICS_BY_CLUSTER[cluster as ClusterId]
      : DEFAULT_TOPICS;
  return rows
    .map(([title, contentCount, score], index) => ({
      id: `topic-${cluster ?? "all"}-${index + 1}`,
      title,
      contentCount,
      views: topicViews(title, contentCount),
      score,
    }))
    .sort((a, b) => b.score - a.score);
}
