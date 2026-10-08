Platform Perencanaan & Pembuatan Konten Berbasis AI — PRD
Status: Draft Author: Bensan Date: 7 Oktober 2026 Fokus versi ini: Front end (end-to-end flow, UI & UX) dengan mock data. Back end ditangani tim lain.

Problem
Tim editorial/media harus berpindah-pindah tool untuk menentukan topik, menganalisis performa konten lama, mencari tren, lalu menyusun brief produksi. Proses dari ide sampai draf brief memakan waktu lama, tidak konsisten, dan sering tidak berbasis data.
Platform ini menyatukan seluruh alur dari hulu (insight & ideation berbasis data) sampai hilir (draf brief dan aset konten) dalam satu flow terpandu, dengan AI yang menganalisis performa historis, tren, dan aset yang diunggah user.
Goals

Memangkas waktu dari ide sampai draf brief yang siap dieksekusi.
Membuat keputusan topik dan angle berbasis data (performa historis + tren), bukan intuisi semata.
Menyediakan satu flow linear yang jelas: Insight → Topik → Angle & Format → Draf Brief.
Mendukung semua tipe konten (Video, Image, Carousel, Audio, Text/Artikel) dengan struktur brief yang sesuai tiap tipe.
Menghasilkan prototype front end yang bisa diuji end-to-end dengan mock data, sebagai dasar integrasi back end.
Users
Primary persona: Tim editorial / media

Editor / content planner: menentukan topik, angle, dan format; memilih dari rekomendasi atau input mandiri.
Content producer (video/image/artikel): menerima dan menyunting draf brief, mengganti atau me-regenerate media.
Assumption: peran dan hak akses (approval, multi-user) belum dibahas di versi ini; semua user diasumsikan memiliki akses penuh ke flow.
User Stories

Sebagai editor, saya ingin melihat performa konten historis dan rekomendasi topik tren dalam satu halaman, agar saya bisa memilih topik berdasarkan data.
Sebagai editor, saya ingin bisa memasukkan topik sendiri jika tidak ada rekomendasi yang cocok, agar saya tetap fleksibel.
Sebagai content producer, saya ingin mengunggah materi yang saya punya (dokumen, gambar, video), agar AI memberi angle yang relevan dengan aset tersebut.
Sebagai editor yang belum punya materi, saya ingin sistem langsung merekomendasikan angle dari data historis dan tren, agar saya tidak mulai dari nol.
Sebagai editor, saya ingin memilih satu angle dan satu tipe konten dari beberapa opsi, agar arah produksi jelas sebelum brief dibuat.
Sebagai content producer, saya ingin draf brief yang otomatis terisi dan bisa saya edit (teks visual, media, adegan/slide), agar saya bisa langsung masuk produksi.
Scope
In Scope

Front end seluruh flow 3 step dan semua tipe konten (Video, Image, Carousel, Audio, Text/Artikel).
Prototype interaktif dengan mock data (insight, rekomendasi topik, rekomendasi angle, hasil analisis aset, draf brief, media render).
Simulasi state AI: loading, sukses, error, kosong.
Responsif untuk desktop sebagai prioritas utama.
Out of Scope

Implementasi back end, integrasi API data sosial media, dan model AI sungguhan (ditangani tim lain).
Autentikasi, manajemen user/role, dan workflow approval.
Penjadwalan dan publikasi ke channel.
Rendering/generate media sungguhan (diganti placeholder/mock).
Penyimpanan permanen (draft disimpan hanya di state sesi prototype). Perlu dikonfirmasi apakah perlu fitur simpan draf.
Requirements
A. Flow & Navigasi

R1. Flow terdiri dari 3 step linear dengan stepper/progress indicator yang selalu terlihat: Insight & Topik → Angle & Format → Draf Brief.
R2. User dapat kembali ke step sebelumnya tanpa kehilangan pilihan yang sudah dibuat; mengubah pilihan di step awal memberi peringatan bahwa hasil step berikutnya akan di-reset/di-generate ulang.
R3. Tombol lanjut nonaktif sampai syarat minimum step terpenuhi.
B. Step 1: Insight & Topik Ideation

R4. Halaman Insight menampilkan data performa konten historis (mock) dari dua sumber: media sosial eksternal dan data internal platform, dengan filter periode, channel, dan sumber data.
R5. Insight divisualkan dalam ringkasan metrik utama, grafik tren, dan daftar konten berperforma terbaik/terendah.
R6. Tersedia kurasi rekomendasi topik tren (dari media sosial/kompetitor) dalam bentuk kartu berisi judul topik, alasan rekomendasi, indikator tren, dan sumber.
R7. User dapat memilih satu topik dari rekomendasi atau menginput topik custom (field teks bebas).
R8. Setelah topik dipilih, sistem menampilkan follow-up question: "Apakah Anda punya materi/aset?"
Skenario 1 (punya materi): area unggah mendukung dokumen, gambar, dan video (drag & drop, daftar file, progress, hapus file, validasi tipe dan ukuran). Setelah unggah, tampil status analisis AI dan ringkasan hasil analisis yang dicocokkan dengan data performa optimal.
Skenario 2 (tanpa materi/ide murni): user melanjutkan langsung; sistem menyiapkan rekomendasi dari data historis dan tren.

C. Step 2: Angle & Format Konten

R9. Sistem menampilkan beberapa opsi angle: berbasis aset terlampir (Skenario 1) atau berbasis topik + insight (Skenario 2). Setiap angle memuat judul, deskripsi singkat, dan alasan/dasar data.
R10. Sistem menampilkan opsi tipe format konten: Video, Image, Carousel, Audio, Text/Artikel.
R11. User wajib memilih tepat 1 angle dan 1 tipe konten sebelum lanjut ke Step 3. Validasi dan pesan bantuan ditampilkan bila belum lengkap.
R12. Terdapat ringkasan pilihan (topik, skenario, angle, format) yang terlihat di step ini dan Step 3.
D. Step 3: Generator Draf Brief & Aset (Precreate)

R13. Setelah user masuk Step 3, sistem menampilkan state generating (skeleton/loading bertahap) lalu draf brief yang disesuaikan dengan tipe konten.
R14. Semua field pada draf brief dapat disunting oleh user; tersedia aksi regenerate per bagian dan untuk seluruh draf.
D1. Video

R15. Pengaturan umum: durasi, aspect ratio, pilihan Avatar (untuk video Full AI).
R16. Ringkasan konten (summary) yang bisa diedit.
R17. Daftar adegan (scene). Tiap adegan memuat: timestamp (detik ke-X sampai ke-Y), media render/preview dengan aksi ganti dan generate ulang, serta input teks visual (deskripsi/skrip visual).
R18. User dapat menambah, menghapus, dan mengurutkan ulang adegan; timestamp tervalidasi agar tidak tumpang tindih dan sesuai total durasi.
D2. Image

R19. Pengaturan umum: aspect ratio, pilihan Avatar (jika relevan/Full AI).
R20. Informasi gambar: media render/preview (ganti dan generate ulang) dan input teks visual untuk elemen/teks pada gambar.
D3. Carousel

R21. Pengaturan umum: jumlah slide dan aspect ratio gambar.
R22. Per slide: media render/preview (ganti dan generate ulang) dan input teks visual. Perubahan jumlah slide menambah/mengurangi kartu slide secara dinamis, dengan reorder slide.
D4. Audio

R23. Spesifikasi format audio, skrip voiceover, dan musik latar. Assumption: struktur detail (durasi, jenis suara, mood musik, pemutar preview mock) akan diusulkan pada desain dan perlu divalidasi.
D5. Text / Artikel

R24. Editor untuk draf teks artikel, copywriting, atau caption panjang (rich text sederhana, hitung kata/karakter). Assumption: struktur detail (judul, outline/subjudul, isi, meta) perlu divalidasi, terutama karena cakupan mencakup blog/artikel.
E. Mock Data & State

R25. Seluruh data berasal dari lapisan mock terpisah (service/mock layer) dengan kontrak data yang mudah diganti oleh API sungguhan. Latensi AI disimulasikan.
R26. Minimal satu dataset mock lengkap per skenario (1 dan 2) dan per tipe konten, agar seluruh jalur flow dapat didemokan.
R27. Setiap layar memiliki state loading, empty, dan error yang terdefinisi.
F. Non-Functional

R28. UI konsisten (design system/komponen yang dapat dipakai ulang) dan mudah digunakan oleh user non-teknis.
R29. Aksesibilitas dasar: navigasi keyboard, kontras warna memadai, label form jelas.
R30. Performa: transisi antar-step terasa responsif; loading panjang selalu diberi indikator progres.
R31. Instrumentasi event (mock/log) untuk mengukur waktu per step dan total waktu dari mulai flow hingga draf brief siap, mendukung metrik sukses.
Success Metrics
Metrik utama: waktu dari ide sampai draf brief.
MetrikDefinisiTargetTime-to-brief (utama)Durasi dari masuk Step 1 sampai draf brief tampil di Step 3 (dan siap diedit)[TBD, usulan: < 5 menit pada usability test; tetapkan baseline proses saat ini]Completion rate flow% sesi yang menyelesaikan Step 1 sampai Step 3[TBD]Waktu per stepMedian waktu tiap step untuk menemukan titik friksi[TBD]Jumlah edit manual drafJumlah perubahan user pada draf yang di-generate (indikator kualitas draf)[TBD]
Karena versi ini berupa prototype, metrik diukur lewat sesi usability testing dengan tim editorial, bukan data produksi.
Risks & Open Questions
Risiko

Kualitas dan format respons AI sungguhan bisa berbeda dari mock sehingga UI perlu penyesuaian saat integrasi. Mitigasi: kontrak data didefinisikan lebih awal bersama tim back end.
Waktu proses AI (analisis aset, generate media) bisa lama; UX loading yang buruk menurunkan persepsi kecepatan dan bisa mengganggu metrik time-to-brief.
Cakupan lima tipe konten cukup besar untuk satu iterasi prototype.
Open Questions

Format dan ukuran maksimal file unggahan (dokumen, gambar, video) apa saja?
Apakah data insight bisa difilter per akun/brand atau per tim?
Apakah draf brief perlu bisa disimpan, diduplikasi, atau diekspor (PDF/doc) di luar flow ini?
Apa yang terjadi setelah draf brief selesai (handoff ke produksi, approval, atau sekadar ekspor)?
Bagaimana perlakuan tipe Audio dan Text/Artikel yang belum memiliki spesifikasi detail?
Apakah avatar berasal dari library tetap atau dapat dikustomisasi?
Apakah perlu dukungan bahasa (ID/EN) di UI dan konten hasil generate?
Timeline
TBD. Usulan fase (belum disepakati):

Alignment flow dan kontrak data mock
Desain UI/UX (wireframe → hi-fi)
Prototype Step 1 & 2
Prototype Step 3 (Video, Image, Carousel, lalu Audio dan Text)
Usability testing dan revisi