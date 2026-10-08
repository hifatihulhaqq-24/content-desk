# PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Social Media Analytics Platform (SaaS)**  
Fase 1 – Front End (UI/UX) dengan Mock Data

## 1. Project Information

| **Field**              | **Detail**                                                                                                                         |
|------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Nama Proyek            | Social Media Analytics Platform (SaaS) – Dashboard Layout & UI Kit                                                                 |
| Versi Dokumen          | v1.0                                                                                                                               |
| Tanggal                | 7 Oktober 2026                                                                                                                     |
| Product Owner          | [Diisi kemudian]                                                                                                                 |
| Author                 | Tim Produk                                                                                                                         |
| Status                 | Draft                                                                                                                              |
| Fase                   | Fase 1 – Front End (UI/UX) menggunakan mock data untuk demo. Integrasi API oleh Tim Back End pada fase berikutnya.                 |
| Tech Stack (Front End) | React + Tailwind CSS + shadcn/ui (chart berbasis Recharts melalui komponen Chart shadcn/ui). Framework: TBD (lihat Open Questions) |

## 2. Background & Goals

### Latar Belakang

Tim social media dan marketing saat ini harus membuka dashboard native dari tiap platform (Instagram, TikTok, YouTube, Facebook, X) untuk memantau performa konten. Data tersebar, metrik tidak seragam, dan sulit membandingkan performa antar platform maupun antar akun.

Platform SaaS ini akan menyatukan data analitik semua platform dan akun dalam satu dashboard. Pada fase pertama, fokus tim adalah membangun layout, navigasi, dan UI Kit penyajian data (UI/UX) dengan mock data, sehingga dapat didemokan ke stakeholder sambil menunggu integrasi dari Tim Back End.

### Tujuan

- Menyediakan layout SaaS dashboard yang konsisten, responsif (mobile & desktop), dengan light mode sebagai default
- Menyediakan struktur navigasi sidebar: Overview, Analytics Dashboard (per platform dan per akun), Create, dan Setting

- Membangun UI Kit penyajian data (chart, grafik, tabel, kartu metrik) yang reusable berbasis shadcn/ui
- Menyiapkan mock data layer yang kontrak datanya mudah diganti dengan API asli tanpa mengubah komponen UI

- Menghasilkan demo yang meyakinkan: data analitik terlihat realistis dan semua state (loading, empty, error) tertangani

## 3. Success Metrics

| **Metrik**          | **Target**                                                                                                             | **Cara Ukur**               |
|---------------------|------------------------------------------------------------------------------------------------------------------------|-----------------------------|
| Kelengkapan halaman | 100% halaman menu (Overview, Analytics per platform & akun, Create, Setting) dapat diakses dan tampil dengan data mock | Checklist demo / QA         |
| Responsivitas       | Tidak ada horizontal scroll & layout tidak pecah di lebar 360, 768, 1024, 1440 px                                      | QA manual + Chrome DevTools |
| Cakupan UI Kit      | Semua komponen data viz pada Bab 5.7 tersedia dan terdokumentasi di halaman /ui-kit                                    | Review komponen             |
| Aksesibilitas       | Lighthouse Accessibility ≥ 90; kontras teks memenuhi WCAG AA                                                           | Lighthouse                  |
| Performa            | Lighthouse Performance ≥ 85 (desktop) pada halaman Overview                                                            | Lighthouse                  |
| Kesiapan integrasi  | Pergantian mock ke API hanya mengubah service layer, tanpa perubahan di komponen UI                                    | Code review                 |
| Hasil demo          | Demo ke stakeholder berjalan tanpa error / bug blocker                                                                 | Feedback sesi demo          |

## 4. Feature List

| **No** | **Nama Fitur**                         | **Prioritas** | **Status** |
|--------|----------------------------------------|---------------|------------|
| 1      | App Shell, Sidebar & Responsive Layout | High          | New        |
| 2      | Overview (Performa Keseluruhan)        | High          | New        |
| 3      | Analytics Dashboard – Halaman Platform | High          | New        |
| 4      | Analytics Dashboard – Halaman Akun     | High          | New        |
| 5      | Create (Content Composer – UI Only)    | Medium        | New        |
| 6      | Setting                                | Medium        | New        |
| 7      | UI Kit Data Visualization              | High          | New        |
| 8      | Mock Data Layer & State Handling       | High          | New        |

## 5. Detail Feature

### 5.0 Struktur Sidebar & Aturan Global

Struktur menu sidebar yang disepakati:

| **Level 1**         | **Level 2** | **Level 3**                           | **Route (usulan)**                                       |
|---------------------|-------------|---------------------------------------|----------------------------------------------------------|
| Overview            | \-          | \-                                    | /overview                                                |
| Analytics Dashboard | Instagram   | Account 1, Account 2, … (daftar akun) | /analytics/instagram, /analytics/instagram/[accountId] |
|                     | TikTok      | Daftar akun                           | /analytics/tiktok, /analytics/tiktok/[accountId]       |
|                     | YouTube     | Daftar akun                           | /analytics/youtube, /analytics/youtube/[accountId]     |
|                     | Facebook    | Daftar akun                           | /analytics/facebook, /analytics/facebook/[accountId]   |
|                     | X           | Daftar akun                           | /analytics/x, /analytics/x/[accountId]                 |
| Create              | \-          | \-                                    | /create                                                  |
| Setting             | \-          | \-                                    | /settings                                                |

#### Aturan Global

- Light mode adalah tema default. Token warna disiapkan lewat CSS variables shadcn/ui sehingga dark mode dapat ditambahkan tanpa refactor.
- Desktop (≥1024 px): sidebar tetap di kiri (±256 px), dapat di-collapse menjadi icon rail (±64 px). Konten utama dengan max-width dan grid 12 kolom.

- Tablet (768–1023 px): sidebar default collapsed (icon rail); grid chart 2 kolom.
- Mobile (\<768 px): sidebar menjadi drawer (Sheet) yang dibuka dari hamburger di top bar; grid 1 kolom; tabel dapat di-scroll horizontal di dalam container sendiri.

- Menu Analytics Dashboard berupa collapsible; tiap platform dapat di-expand untuk menampilkan daftar akunnya. Item aktif ditandai jelas, dan state expand tersimpan selama sesi.
- Tiap platform memiliki ikon dan warna brand yang konsisten (PlatformBadge) di seluruh aplikasi.

### 5.1 App Shell, Sidebar & Responsive Layout

#### User Story

Sebagai social media manager, saya ingin navigasi sidebar yang jelas dan mudah diakses di desktop maupun mobile, agar saya dapat berpindah antar platform dan akun dengan cepat.

Sebagai pengguna mobile, saya ingin menu tersedia dalam drawer, agar layar tetap lega untuk melihat grafik.

#### Flow

1.  Pengguna membuka aplikasi dan diarahkan ke halaman Overview (light mode)
2.  Pengguna melihat sidebar dengan menu Overview, Analytics Dashboard, Create, dan Setting

3.  Pengguna meng-expand Analytics Dashboard lalu memilih platform (mis. Instagram)
4.  Pengguna memilih salah satu akun (mis. Account 1) dan halaman akun tampil

5.  Di mobile, pengguna membuka menu lewat ikon hamburger dan drawer menutup otomatis setelah memilih halaman

#### Feature Set

| **No** | **Komponen**                         | **Deskripsi**                                                                                    | **Tipe**                      | **Wajib** |
|--------|--------------------------------------|--------------------------------------------------------------------------------------------------|-------------------------------|-----------|
| 1      | Sidebar                              | Menu bertingkat (collapsible), item aktif, collapse ke icon rail, footer berisi profil/workspace | UI Component (shadcn Sidebar) | Ya        |
| 2      | Top Bar                              | Breadcrumb, judul halaman, date range global, avatar menu; hamburger di mobile                   | UI Component                  | Ya        |
| 3      | Mobile Drawer                        | Sidebar versi mobile memakai Sheet                                                               | UI Component                  | Ya        |
| 4      | Breadcrumb                           | Contoh: Analytics \> Instagram \> Account 1                                                      | UI Component                  | Ya        |
| 5      | Theme Provider                       | Default light; struktur token siap dark mode                                                     | Konfigurasi                   | Ya        |
| 6      | Platform Switcher / Account Selector | Dropdown untuk berpindah akun di halaman platform                                                | UI Component                  | Tidak     |
| 7      | Dark Mode Toggle                     | Saklar tema di Setting (opsional, lihat Open Questions)                                          | UI Component                  | Tidak     |

#### Expected Result

- Navigasi konsisten di semua halaman dan semua ukuran layar
- Sidebar collapse/expand dan drawer mobile berfungsi tanpa layout shift yang mengganggu

- Item menu aktif dan breadcrumb selalu sesuai halaman yang dibuka
- Aplikasi tampil light mode saat pertama kali dibuka

### 5.2 Overview (Performa Keseluruhan)

#### User Story

Sebagai marketing lead, saya ingin melihat ringkasan performa semua platform dalam satu halaman, agar saya dapat menilai kondisi akun social media secara cepat.

#### Flow

1.  Pengguna membuka menu Overview
2.  Sistem menampilkan KPI utama gabungan semua platform untuk periode default (30 hari terakhir)

3.  Pengguna mengubah periode lewat date range picker dan seluruh kartu serta grafik ikut diperbarui
4.  Pengguna melihat perbandingan performa antar platform dan daftar konten terbaik

5.  Pengguna mengklik kartu platform untuk membuka halaman Analytics platform tersebut

#### Feature Set

| **No** | **Komponen**           | **Deskripsi**                                                                                                                        | **Tipe**          | **Wajib** |
|--------|------------------------|--------------------------------------------------------------------------------------------------------------------------------------|-------------------|-----------|
| 1      | KPI Stat Cards         | Total followers, reach, impressions, engagement rate, total post; masing-masing dengan delta (%) vs periode sebelumnya dan sparkline | StatCard          | Ya        |
| 2      | Trend Chart Gabungan   | Line/area chart reach atau impressions per hari, dengan toggle metrik                                                                | Line / Area Chart | Ya        |
| 3      | Perbandingan Platform  | Stacked bar atau bar horizontal kontribusi tiap platform                                                                             | Bar Chart         | Ya        |
| 4      | Komposisi Followers    | Donut chart share followers per platform (maksimal 5 segmen)                                                                         | Donut Chart       | Ya        |
| 5      | Platform Summary Cards | 5 kartu ringkas (ikon, followers, delta, engagement) yang menjadi link ke halaman platform                                           | Card              | Ya        |
| 6      | Top Content            | Tabel 5–10 konten terbaik lintas platform (sortable)                                                                                 | Data Table        | Ya        |
| 7      | Best Time to Post      | Heatmap hari x jam berdasarkan engagement                                                                                            | Heatmap           | Tidak     |
| 8      | Date Range Filter      | Preset 7/30/90 hari dan custom range                                                                                                 | Filter            | Ya        |

#### Expected Result

- Halaman Overview memuat semua KPI dan grafik dari mock data dalam satu layar scroll yang rapi
- Perubahan date range memperbarui seluruh komponen secara konsisten

- Kartu platform dapat diklik dan membawa pengguna ke halaman platform yang sesuai
- Tampilan tetap terbaca di mobile (kartu ditumpuk, chart menyesuaikan lebar)

### 5.3 Analytics Dashboard – Halaman Platform

#### User Story

Sebagai social media manager, saya ingin melihat performa detail per platform (Instagram, TikTok, YouTube, Facebook, X), agar saya memahami apa yang berhasil di masing-masing platform.

#### Flow

1.  Pengguna memilih platform dari sidebar (mis. TikTok)
2.  Sistem menampilkan header platform (ikon, jumlah akun terhubung) dan KPI khusus platform tersebut

3.  Pengguna melihat tren metrik utama, distribusi tipe konten, dan top content platform
4.  Pengguna melihat daftar akun milik platform tersebut beserta ringkasan performanya

5.  Pengguna mengklik salah satu akun untuk membuka detail akun

#### Feature Set

| **No** | **Komponen**                  | **Deskripsi**                                                                      | **Tipe**          | **Wajib** |
|--------|-------------------------------|------------------------------------------------------------------------------------|-------------------|-----------|
| 1      | Platform Header               | Nama, ikon, warna brand, jumlah akun, tombol ganti periode                         | Header            | Ya        |
| 2      | KPI Cards (spesifik platform) | Metrik berbeda per platform sesuai tabel metrik di bawah                           | StatCard          | Ya        |
| 3      | Trend Chart                   | Line/area chart dengan pemilihan metrik dan perbandingan dengan periode sebelumnya | Line / Area Chart | Ya        |
| 4      | Content Type Breakdown        | Bar/donut performa per tipe konten (mis. Reels, Carousel, Image)                   | Bar / Donut Chart | Ya        |
| 5      | Daftar Akun                   | Tabel/kartu akun: followers, growth, engagement, link ke detail akun               | Data Table        | Ya        |
| 6      | Top Posts                     | Tabel konten terbaik dengan thumbnail placeholder, tanggal, metrik utama           | Data Table        | Ya        |
| 7      | Audience Snapshot             | Gender, rentang usia, lokasi teratas                                               | Bar / Donut Chart | Tidak     |

#### Expected Result

- Setiap platform memiliki halaman dengan metrik yang relevan dan terstruktur sama (komponen reusable, hanya konfigurasi metrik yang berbeda)
- Daftar akun muncul dan terhubung ke halaman detail akun

- Halaman bekerja baik di mobile dan desktop

#### Usulan Metrik per Platform (dapat disesuaikan dengan ketersediaan data BE)

| **Platform** | **Metrik Utama (KPI Cards)**                           | **Metrik Tambahan (Chart/Tabel)**                                             |
|--------------|--------------------------------------------------------|-------------------------------------------------------------------------------|
| Instagram    | Followers, Reach, Impressions, Engagement Rate         | Likes, Comments, Shares, Saves, Profile Visits, performa Reels/Carousel/Story |
| TikTok       | Followers, Video Views, Engagement Rate, Profile Views | Likes, Comments, Shares, Avg Watch Time, Completion Rate                      |
| YouTube      | Subscribers, Views, Watch Time, Avg View Duration      | Impressions CTR, Likes, Comments, Traffic Source, Top Videos                  |
| Facebook     | Page Followers, Reach, Post Engagement, Page Views     | Reactions, Shares, Comments, Link Clicks                                      |
| X            | Followers, Impressions, Engagements, Engagement Rate   | Reposts, Likes, Replies, Link Clicks, Profile Visits                          |

### 5.4 Analytics Dashboard – Halaman Akun

#### User Story

Sebagai content creator, saya ingin melihat performa satu akun secara mendalam (mis. Instagram – Account 1), agar saya tahu konten mana yang perlu diulang atau diperbaiki.

#### Flow

1.  Pengguna memilih akun dari sidebar (Analytics \> Instagram \> Account 1) atau dari daftar akun di halaman platform
2.  Sistem menampilkan profil akun (avatar, nama, handle, status koneksi) dan KPI akun

3.  Pengguna melihat tren performa dan overview konten akun tersebut
4.  Pengguna memfilter/sort daftar konten berdasarkan tanggal, tipe konten, atau metrik

5.  Pengguna membuka detail konten (drawer/dialog) untuk melihat metrik per konten

#### Feature Set

| **No** | **Komponen**     | **Deskripsi**                                                                       | **Tipe**          | **Wajib** |
|--------|------------------|-------------------------------------------------------------------------------------|-------------------|-----------|
| 1      | Account Header   | Avatar, nama, handle, platform badge, status koneksi, tanggal sinkronisasi terakhir | Header            | Ya        |
| 2      | KPI Cards        | KPI sama dengan halaman platform namun untuk satu akun                              | StatCard          | Ya        |
| 3      | Trend Chart      | Pertumbuhan followers dan tren reach/impressions/engagement                         | Line / Area Chart | Ya        |
| 4      | Content Overview | Ringkasan konten: jumlah post per tipe, rata-rata engagement per tipe               | Bar / Donut Chart | Ya        |
| 5      | Content List     | Tabel konten dengan search, filter, sort, pagination                                | Data Table        | Ya        |
| 6      | Content Detail   | Drawer/dialog berisi metrik detail satu konten                                      | Sheet / Dialog    | Ya        |
| 7      | Posting Heatmap  | Waktu posting terbaik untuk akun ini                                                | Heatmap           | Tidak     |
| 8      | Audience Detail  | Demografi audiens (gender, usia, lokasi)                                            | Bar / Donut Chart | Tidak     |

#### Expected Result

- Pengguna mendapat gambaran performa akun dan kontennya dalam satu halaman
- Daftar konten dapat difilter dan diurutkan tanpa error

- Halaman akun tetap rapi di mobile (tabel menggunakan scroll internal atau tampilan kartu)

### 5.5 Create (Content Composer – UI Only)

#### User Story

Sebagai content creator, saya ingin menyusun konten dan memilih platform tujuan dalam satu form, agar proses pembuatan konten terpusat.

#### Flow

1.  Pengguna membuka menu Create
2.  Pengguna memilih platform dan akun tujuan (multi-select)

3.  Pengguna mengisi caption, menambahkan media (placeholder upload), dan memilih jadwal
4.  Sistem menampilkan preview konten sesuai platform terpilih

5.  Pengguna menekan Simpan Draft / Jadwalkan dan sistem menampilkan notifikasi sukses (mock, tanpa publish sungguhan)

#### Feature Set

| **No** | **Komponen**               | **Deskripsi**                                 | **Tipe**       | **Wajib** |
|--------|----------------------------|-----------------------------------------------|----------------|-----------|
| 1      | Platform & Account Picker  | Multi-select platform dan akun                | Form Component | Ya        |
| 2      | Caption Editor             | Textarea dengan counter karakter per platform | Form Component | Ya        |
| 3      | Media Upload (placeholder) | Dropzone UI tanpa upload sungguhan            | Form Component | Ya        |
| 4      | Schedule Picker            | Tanggal dan jam publikasi                     | Form Component | Tidak     |
| 5      | Live Preview               | Preview tampilan konten per platform          | UI Display     | Tidak     |
| 6      | Toast Notifikasi           | Konfirmasi aksi (mock)                        | Feedback       | Ya        |

#### Expected Result

- Halaman Create tampil lengkap dan dapat dipakai pada demo (alur UI)
- Validasi form dasar berjalan (platform wajib dipilih, caption tidak kosong)

- Tidak ada publikasi sungguhan; seluruh aksi bersifat mock

### 5.6 Setting

#### User Story

Sebagai admin workspace, saya ingin mengatur profil, akun terhubung, tampilan, dan notifikasi, agar platform sesuai kebutuhan tim.

#### Flow

1.  Pengguna membuka menu Setting
2.  Pengguna memilih tab: Profile, Connected Accounts, Appearance, Notifications

3.  Pengguna mengubah pengaturan dan menekan Simpan
4.  Sistem menampilkan notifikasi sukses (mock)

#### Feature Set

| **No** | **Komponen**         | **Deskripsi**                                                                     | **Tipe**    | **Wajib** |
|--------|----------------------|-----------------------------------------------------------------------------------|-------------|-----------|
| 1      | Tab Navigasi Setting | Profile, Connected Accounts, Appearance, Notifications (mobile: select/accordion) | Tabs        | Ya        |
| 2      | Profile              | Nama, email, avatar, workspace                                                    | Form        | Ya        |
| 3      | Connected Accounts   | Daftar akun per platform dengan status; tombol Connect/Disconnect (mock)          | List / Card | Ya        |
| 4      | Appearance           | Pilihan tema (Light default), bahasa, format tanggal                              | Form        | Tidak     |
| 5      | Notifications        | Saklar notifikasi email/in-app                                                    | Form        | Tidak     |

#### Expected Result

- Pengguna dapat berpindah antar tab dan mengubah pengaturan (disimpan di state lokal)
- Daftar Connected Accounts konsisten dengan akun yang muncul di sidebar Analytics

### 5.7 UI Kit Data Visualization

#### User Story

Sebagai front end developer, saya ingin komponen data viz yang reusable dan konsisten, agar pembuatan halaman analytics cepat dan mudah dirawat.

Sebagai desainer, saya ingin satu halaman referensi UI Kit, agar semua komponen dan variasinya dapat ditinjau dan disepakati.

#### Flow

1.  Developer membuka halaman /ui-kit
2.  Developer melihat tiap komponen dengan variasi (default, loading, empty, error) beserta contoh penggunaan

3.  Developer memakai komponen pada halaman dengan memasukkan data sesuai kontrak (props) yang terdokumentasi

#### Feature Set

| **No** | **Komponen**                       | **Deskripsi**                                                                                          | **Tipe**                  | **Wajib** |
|--------|------------------------------------|--------------------------------------------------------------------------------------------------------|---------------------------|-----------|
| 1      | ChartCard                          | Wrapper standar: judul, deskripsi, filter periode, aksi, area chart, legend, state loading/empty/error | Layout Component          | Ya        |
| 2      | StatCard                           | Nilai metrik, delta badge (naik/turun), sparkline opsional                                             | Data Display              | Ya        |
| 3      | TrendChart (Line/Area)             | Satu/lebih seri, tooltip, legend, perbandingan periode                                                 | Chart                     | Ya        |
| 4      | BarChart                           | Vertikal, horizontal, grouped, stacked                                                                 | Chart                     | Ya        |
| 5      | DonutChart                         | Komposisi dengan label tengah (total), legend                                                          | Chart                     | Ya        |
| 6      | Heatmap                            | Grid hari x jam dengan skala warna                                                                     | Chart (custom)            | Tidak     |
| 7      | DataTable                          | Sort, filter, search, pagination, kolom sticky, responsive                                             | Table (TanStack + shadcn) | Ya        |
| 8      | DeltaBadge, PlatformBadge          | Indikator perubahan (%) dan badge platform dengan warna brand                                          | Atomic Component          | Ya        |
| 9      | DateRangePicker                    | Preset dan custom range                                                                                | Filter                    | Ya        |
| 10     | Skeleton / EmptyState / ErrorState | State pendukung untuk semua komponen data                                                              | Feedback                  | Ya        |
| 11     | Chart Theme Tokens                 | Palet warna chart (--chart-1 … --chart-5) dan warna brand platform                                     | Design Token              | Ya        |

#### Expected Result

- Seluruh halaman analytics dibangun dari komponen UI Kit, tanpa chart yang di-hardcode per halaman
- Halaman /ui-kit menjadi referensi hidup untuk desainer dan developer

- Setiap komponen menerima data lewat props bertipe (TypeScript) sehingga tidak bergantung pada sumber data

#### Rekomendasi Jenis Visualisasi (Umum Digunakan untuk Data Analytics)

| **Jenis Data / Pertanyaan**  | **Visualisasi**               | **Contoh di Platform Ini**                   | **Catatan**                                                                                   |
|------------------------------|-------------------------------|----------------------------------------------|-----------------------------------------------------------------------------------------------|
| Satu angka kunci + perubahan | Stat Card + Delta + Sparkline | Total followers, engagement rate             | Tampilkan delta vs periode sebelumnya; warna hijau/merah plus ikon panah (jangan hanya warna) |
| Tren terhadap waktu          | Line / Area Chart             | Reach, impressions, pertumbuhan followers    | Maksimal 3–4 seri; area untuk satu seri utama; sediakan tooltip                               |
| Perbandingan antar kategori  | Bar Chart (vertikal)          | Engagement per tipe konten, post per hari    | Mulai sumbu dari 0                                                                            |
| Peringkat (ranking)          | Bar Chart horizontal          | Top platform, top lokasi audiens             | Urutkan dari terbesar; label panjang lebih mudah dibaca                                       |
| Komposisi dari total         | Donut Chart / Stacked Bar     | Share followers per platform, gender audiens | Donut maksimal 5 segmen; gunakan stacked bar jika lebih banyak                                |
| Komposisi sepanjang waktu    | Stacked Area / Stacked Bar    | Impressions per platform per minggu          | Gunakan warna brand platform secara konsisten                                                 |
| Pola waktu (hari x jam)      | Heatmap                       | Waktu terbaik untuk posting                  | Gunakan skala satu warna dengan legend                                                        |
| Daftar detail & perbandingan | Data Table                    | Top posts, daftar akun                       | Sort, search, pagination; di mobile scroll horizontal                                         |
| Progres terhadap target      | Progress Bar                  | Target followers bulanan                     | Opsional                                                                                      |
| Alur konversi                | Funnel (bar bertingkat)       | Impressions → Reach → Engagement → Click     | Opsional, fase lanjutan                                                                       |

Library yang direkomendasikan: komponen Chart shadcn/ui (membungkus Recharts) untuk line, area, bar, dan donut; TanStack Table melalui pola Data Table shadcn/ui; Heatmap dibuat custom dengan CSS grid. Hindari chart 3D, pie dengan banyak segmen, dan gauge karena sulit dibaca dan memboroskan ruang.

#### Pedoman Visual Chart

- Gunakan warna dari token chart (--chart-1 … --chart-5); warna brand platform hanya untuk badge/identifikasi platform
- Tooltip dan legend selalu tersedia; angka diformat ringkas (1,2K / 3,4M) dan locale Indonesia untuk tanggal

- Setiap chart wajib memiliki state loading (skeleton), empty, dan error
- Chart responsif mengikuti lebar container; di mobile kurangi jumlah tick sumbu dan tinggi chart ±220–260 px

- Informasi tidak hanya mengandalkan warna (gunakan ikon, label, atau pola) demi aksesibilitas

### 5.8 Mock Data Layer & State Handling

#### User Story

Sebagai front end developer, saya ingin mock data yang realistis dan terstruktur, agar demo dapat berjalan sebelum API Back End siap.

Sebagai Tim Back End, saya ingin kontrak data yang jelas dari mock, agar API dapat dibuat sesuai kebutuhan UI.

#### Flow

1.  Komponen halaman memanggil hook data (mis. useOverview, usePlatformAnalytics, useAccountAnalytics)
2.  Hook memanggil service layer (AnalyticsService) yang pada fase ini mengembalikan mock data dengan simulasi latency 300–800 ms

3.  Sistem menampilkan skeleton saat loading, lalu data; empty state atau error state bila diperlukan
4.  Saat API siap, implementasi service diganti dari mock ke HTTP client tanpa mengubah komponen UI

#### Feature Set

| **No** | **Komponen**             | **Deskripsi**                                                                                                | **Tipe**     | **Wajib** |
|--------|--------------------------|--------------------------------------------------------------------------------------------------------------|--------------|-----------|
| 1      | Tipe Data (TypeScript)   | Interface: Workspace, Platform, Account, KpiMetric, TimeSeriesPoint, Post, AudienceBreakdown, HeatmapCell    | Kontrak Data | Ya        |
| 2      | Mock Generator           | Data deterministik (seeded) untuk 5 platform, ±2–3 akun per platform, 90 hari data harian, ±50 post per akun | Data         | Ya        |
| 3      | Service Layer            | Interface AnalyticsService dengan implementasi MockAnalyticsService; switch lewat env (USE_MOCK=true)        | Arsitektur   | Ya        |
| 4      | Data Hooks               | Hook berbasis TanStack Query (loading, error, refetch)                                                       | Logic        | Ya        |
| 5      | Simulasi State           | Query param/dev toggle untuk memaksa loading, empty, error saat demo                                         | Dev Tool     | Tidak     |
| 6      | Dokumen Kontrak untuk BE | Daftar endpoint dan skema respons usulan berdasarkan mock                                                    | Dokumentasi  | Ya        |

#### Expected Result

- Semua halaman menampilkan data analitik yang konsisten antar halaman (angka Overview = penjumlahan data platform)
- Perubahan date range menghasilkan data mock yang berbeda dan masuk akal

- Tim BE memperoleh kontrak data yang jelas dari tipe dan contoh respons

#### Usulan Endpoint Kontrak Data (untuk dibahas dengan Tim BE)

| **Endpoint (usulan)**               | **Kegunaan**                                           | **Parameter**              |
|-------------------------------------|--------------------------------------------------------|----------------------------|
| GET /overview                       | KPI, tren, perbandingan platform, top content gabungan | from, to                   |
| GET /platforms/{platform}/analytics | KPI, tren, breakdown, top posts untuk satu platform    | from, to, metric           |
| GET /platforms/{platform}/accounts  | Daftar akun beserta ringkasan                          | \-                         |
| GET /accounts/{accountId}/analytics | KPI, tren, overview konten untuk satu akun             | from, to                   |
| GET /accounts/{accountId}/posts     | Daftar konten dengan filter dan pagination             | from, to, type, sort, page |
| GET /accounts/{accountId}/audience  | Demografi audiens                                      | from, to                   |

## 6. Roles

| **Role**                   | **Akses / Keterlibatan**                                                   |
|----------------------------|----------------------------------------------------------------------------|
| Social Media Manager       | Pengguna utama: memantau analytics semua platform dan akun, memakai Create |
| Content Creator            | Melihat performa konten, menyusun konten lewat Create                      |
| Marketing Lead / Executive | Melihat Overview dan laporan ringkas performa                              |
| Admin Workspace            | Mengelola Setting dan akun terhubung                                       |
| Front End Developer        | Implementasi UI, UI Kit, dan mock data layer                               |
| UI/UX Designer             | Desain layout, komponen, dan review UI Kit                                 |
| Tim Back End               | Menyediakan API dan mengintegrasikan kontrak data pada fase berikutnya     |

## 7. Possible Impacted System

| **Sistem / Modul**                                | **Dampak**                                                       | **Catatan**                       |
|---------------------------------------------------|------------------------------------------------------------------|-----------------------------------|
| Back End API (Tim BE)                             | Perlu menyesuaikan skema respons dengan kontrak data dari mock   | Dibahas bersama sebelum integrasi |
| Authentication & Workspace                        | Belum termasuk fase ini; layout menyiapkan area profil/workspace | Dibahas pada fase integrasi       |
| Integrasi API Platform (Meta, TikTok, YouTube, X) | Sumber data nyata dikelola BE                                    | Di luar scope Front End           |
| Design System                                     | Token warna, tipografi, dan komponen baru berbasis shadcn/ui     | Perlu disepakati dengan desainer  |
| CI/CD & Hosting                                   | Preview deployment untuk demo                                    | Mis. Vercel/Netlify, TBD          |

## 8. Design (Link Figma) / Capture

| **Field**        | **Detail**                                                                                                                                                                                                                 |
|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Link Figma       | TBD                                                                                                                                                                                                                        |
| Referensi Layout | https://id.pinterest.com/pin/151855818681756459/ (dashboard SaaS sebagai acuan guideline layout)                                                                                                                           |
| Status Desain    | Referensi tersedia; desain final belum dimulai                                                                                                                                                                             |
| Catatan          | Tautan Pinterest tidak dapat diakses otomatis saat dokumen ini disusun. Tim desain/produk perlu menambahkan screenshot referensi pada bagian ini dan memastikan detail gaya (spasi, kartu, warna, tipografi) sesuai acuan. |
| Capture          | [Screenshot referensi akan ditambahkan]                                                                                                                                                                                  |

#### Guideline Desain Awal (sementara, menunggu konfirmasi referensi)

- Tema: light mode default dengan latar netral terang, kartu putih berborder tipis dan radius sudut sedang
- Layout: sidebar kiri, top bar, area konten berbasis kartu dengan grid responsif

- Tipografi: sans-serif modern (mis. Inter/Geist), hierarki jelas antara judul halaman, judul kartu, angka KPI, dan teks bantu
- Spasi: skala 4/8 px; jarak antar kartu konsisten

- Komponen: gunakan shadcn/ui sebagai basis (Sidebar, Card, Tabs, Table, Sheet, Dialog, Select, Calendar/Popover, Skeleton, Toast, Chart)

## 9. Open Questions

| **No** | **Pertanyaan**                                                                                            | **PIC**                   | **Target Jawab** |
|--------|-----------------------------------------------------------------------------------------------------------|---------------------------|------------------|
| 1      | Framework yang dipakai: Next.js atau Vite + React Router?                                                 | Tech Lead FE              | TBD              |
| 2      | Apakah desain Figma akan dibuat terlebih dahulu atau langsung implementasi berbasis referensi Pinterest?  | Product Owner / Designer  | TBD              |
| 3      | Apakah dark mode masuk scope fase ini, atau hanya disiapkan tokennya?                                     | Product Owner             | TBD              |
| 4      | Bahasa antarmuka: Indonesia, Inggris, atau keduanya?                                                      | Product Owner             | TBD              |
| 5      | Daftar final metrik per platform yang ingin ditampilkan, dan metrik mana yang tersedia dari API platform? | Product Owner / Tim BE    | TBD              |
| 6      | Berapa jumlah akun per platform yang perlu ada pada mock data demo?                                       | Product Owner             | TBD              |
| 7      | Seberapa lengkap halaman Create dan Setting pada demo (sekadar tampilan atau ada interaksi)?              | Product Owner             | TBD              |
| 8      | Apakah perlu fitur export laporan (PDF/CSV) atau perbandingan antar akun?                                 | Product Owner             | TBD              |
| 9      | Apakah ada branding (nama produk, logo, warna utama) yang harus dipakai?                                  | Product Owner / Marketing | TBD              |
| 10     | Periode default dan batas maksimum rentang tanggal?                                                       | Product Owner / Tim BE    | TBD              |

## 10. Out of Scope

- Integrasi API Back End dan API resmi platform (Meta, TikTok, YouTube, X)
- Proses OAuth / koneksi akun sungguhan dan publikasi konten sungguhan

- Autentikasi, manajemen user, role & permission, multi-workspace, dan billing/subscription
- Data real-time dan notifikasi push

- Export laporan (PDF/CSV) dan penjadwalan laporan otomatis
- Rekomendasi berbasis AI dan fitur social listening

- Aplikasi native mobile (cakupan hanya web responsif)

## 11. Operational Needs

- Repository & Branching: struktur repo dan konvensi komponen disepakati sebelum mulai
- Preview Deployment: setiap pull request memiliki URL preview untuk review desainer dan stakeholder

- Dokumentasi: halaman /ui-kit dan README penggunaan komponen serta cara mengganti mock ke API
- QA: pengujian di Chrome, Safari, Firefox terbaru; perangkat/lebar 360, 768, 1024, 1440 px

- Handoff ke Tim BE: dokumen kontrak data (tipe + contoh respons) dan sesi walkthrough
- Environment: flag USE_MOCK untuk berpindah antara mock dan API

## 12. Notes

- Fokus fase ini adalah UI/UX; data seluruhnya mock, namun harus terlihat realistis dan konsisten antar halaman
- Struktur sidebar: Menu \> Overview, Analytics Dashboard (Instagram, TikTok, YouTube, Facebook, X; masing-masing berisi daftar akun), Create, Setting

- Halaman akun berisi overview konten untuk masing-masing platform dan akun
- Pilihan metrik, endpoint, dan jumlah halaman bersifat usulan awal dan dapat disesuaikan setelah review dan masukan Tim BE

- Referensi Pinterest tidak dapat dibuka otomatis; mohon lampirkan screenshot agar guideline layout dapat divalidasi

## 13. MoM (Minutes of Meeting)

| **Tanggal** | **Peserta**      | **Agenda**                           | **Keputusan**                | **Action Item**                              | **PIC** | **Deadline** |
|-------------|------------------|--------------------------------------|------------------------------|----------------------------------------------|---------|--------------|
| 07/10/2026  | [Nama peserta] | Kick-off PRD Analytics Platform (FE) | Fokus UI/UX dengan mock data | Finalisasi open questions & referensi desain | [PIC] | [Deadline] |
|             |                  |                                      |                              |                                              |         |              |
|             |                  |                                      |                              |                                              |         |              |