# Phase 2 Development Plan — Ideation & Content Brief

## Goal
Mengimplementasikan Phase 2 PRD: alur lengkap **4 step** dari ideation (insight → topik → angle & format → kesiapan aset → draf brief) dengan mock data, mengikuti arsitektur dan design system yang sudah ada **100% tanpa penyimpangan**. Serta menambahkan menu "Workspace" baru pada sidebar dan halaman daftar proyek (Konten Brief).

## Cakupan Perubahan dari State Saat Ini

Saat ini flow `create` sudah punya **3 step** (Topic → Angle & Format → Brief) dan sidebar menu masih versi awal. Yang perlu dilakukan:

1. **Memperluas flow menjadi 4 step**: Sisipkan step "Kesiapan Aset" (R8) antara Angle/Format dan Brief
2. **Modifikasi step Angle**: Setiap angle mengunci format konten (bukan pilih terpisah) — sesuai PRD
3. **Membuat step baru**: `StepAsset` — tanya "sudah punya aset?" → upload atau cari di DAM internal
4. **Memperluas hook & tipe data**: Tambah state aset di `useCreateFlow` dan `ideation.ts`
5. **Sidebar Menu & Dashboard Workspace**: Tambahkan grup menu Workspace (Konten Brief, Buat Gambar, Buat Video) dan halaman daftar proyek/brief.

---

## 🚨 ATURAN KETAT UI CONSISTENCY — WAJIB DIPATUHI 🚨

> [!CAUTION]
> **ZERO TOLERANCE untuk inkonsistensi UI.** Setiap elemen WAJIB menggunakan komponen design system yang sudah ada. Pelanggaran = refactor ulang sebelum lanjut ke task berikutnya.

### Komponen yang WAJIB Digunakan (DILARANG buat versi custom)

| Kebutuhan | Komponen yang HARUS Dipakai | Import Path |
|---|---|---|
| Container kartu | `Card`, `CardHeader`, `CardContent`, `CardFooter` | `@/components/ui/card` |
| Tombol aksi | `Button` (variant: default/outline/ghost/secondary/destructive) | `@/components/ui/button` |
| Label status | `Badge` (variant: default/secondary/outline/destructive) | `@/components/ui/badge` |
| Input teks | `Input` | `@/components/ui/input` |
| Input panjang | `Textarea` | `@/components/ui/textarea` |
| Skeleton loading | `Skeleton` | `@/components/ui/skeleton` |
| State kosong | `EmptyState` | `@/components/data/states` |
| State error | `ErrorState` | `@/components/data/states` |
| Progress bar | `Progress` | `@/components/ui/progress` |
| Tabel data | `Table`, `TableHeader`, `TableRow`, `TableCell`, dll. | `@/components/ui/table` |
| Tabs | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `@/components/ui/tabs` |
| Bagian brief | `BriefSectionCard`, `RegenerateButton` | `./brief/section-card` |
| Ringkasan pilihan | `SelectionSummary` | `./selection-summary` |
| Layout halaman | `PageContainer`, `PageHeader` | `@/components/layout/page-container` |
| Stepper | `FlowStepper` | `./flow-stepper` |
| Dialog konfirmasi | `Dialog`, `DialogContent`, dll. | `@/components/ui/dialog` |

### Token Warna yang WAJIB Dipakai (DILARANG hardcode hex/rgb)

```
Backgrounds:  bg-card, bg-background, bg-muted, bg-muted/40, bg-primary/10
Borders:      border-border, border-primary, border-primary/40, border-dashed
Text:         text-foreground, text-muted-foreground, text-primary, text-primary-foreground
Semantic:     text-positive / bg-positive-soft (sukses), text-destructive (error)
```

### Pola Layout Section yang HARUS Diikuti

```tsx
// ✅ BENAR — mengikuti pola existing (section-card.tsx, flow-stepper.tsx)
<section className="rounded-xl border border-border bg-card p-4 shadow-xs">
  <div className="flex flex-wrap items-start justify-between gap-2">
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    {actions}
  </div>
  <div className="mt-3">{children}</div>
</section>

// ❌ SALAH — jangan pernah bikin ini
<div className="p-4 bg-white rounded-lg shadow-md border-gray-200">
<div className="bg-[#f8f9fa] p-3 rounded">
```

### Pola Selection Card yang HARUS Diikuti

```tsx
// ✅ BENAR — mengikuti pola existing (step-topic.tsx, step-angle.tsx)
<button
  type="button"
  aria-pressed={selected}
  className={cn(
    "flex flex-col rounded-xl border bg-card p-4 text-left shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring",
    selected
      ? "border-primary ring-1 ring-primary"
      : "border-border hover:border-primary/40 hover:bg-muted/40"
  )}
>
```

### Spacing yang HARUS Konsisten

| Konteks | Spacing |
|---|---|
| Root container step (antar section) | `space-y-6` |
| Internal section (antar elemen) | `space-y-3` |
| Grid gap | `gap-3` |
| Padding kartu | `p-4` |
| Margin top konten dalam section | `mt-3` |

### Checklist Anti-SLOP (WAJIB dicek per file sebelum commit)

- [ ] Tidak ada `<div>` dengan `bg-white`, `bg-gray-*`, `bg-slate-*`, atau hex color
- [ ] Tidak ada `<button>` tanpa `type="button"` (kecuali submit)
- [ ] Tidak ada raw `<input>` — harus pakai `<Input>` dari ui
- [ ] Tidak ada custom border-radius — harus `rounded-xl` (mengikuti Card pattern)
- [ ] Tidak ada inline shadow selain `shadow-xs` pada card-level
- [ ] Semua interactive card punya `aria-pressed`, `focus-visible:outline-2 focus-visible:outline-ring`
- [ ] Semua data-fetch punya 3 state: Loading (Skeleton), Error (ErrorState), Empty (EmptyState)
- [ ] Tidak ada font-size custom — hanya `text-xs`, `text-sm`, `text-base`
- [ ] Semua ikon dari `lucide-react`, sizing `size-3.5` atau `size-4`

---

## Proposed Changes

### Task 1: Tipe Data & Konfigurasi

#### [MODIFY] `src/types/ideation.ts`
Tambah tipe untuk aset dan perluas `AngleOption` agar membawa `contentType`:

```diff
+/** Tipe aset yang diupload user */
+export interface UploadedMediaItem {
+  id: string;
+  name: string;
+  size: number;
+  type: "image" | "video" | "document";
+  previewUrl?: string;
+}
+
+/** Aset internal dari DAM perusahaan */
+export interface InternalAssetItem {
+  id: string;
+  title: string;
+  type: "image" | "video";
+  thumbnailUrl: string;
+  resolution: string;
+  matchScore: number;
+  tags: string[];
+  sourceDate: string;
+}
+
 export interface AngleOption {
   id: string;
   title: string;
   description: string;
   basis: string;
+  /** Setiap angle mengunci satu format konten spesifik */
+  contentType: ContentTypeId;
 }
```

Tambah input untuk search internal assets di `IdeationService`:

```diff
+export interface SearchAssetsInput {
+  topic: string;
+  angleId?: string;
+  contentType?: ContentTypeId;
+  query?: string;
+  category?: string;
+}
+
 export interface IdeationService {
   listTopicIdeas(): Promise<TopicIdea[]>;
   generateAngles(input: GenerateAnglesInput): Promise<AngleOption[]>;
   generateBrief(input: GenerateBriefInput): Promise<BriefData>;
+  searchInternalAssets(input: SearchAssetsInput): Promise<InternalAssetItem[]>;
 }
```

---

#### [MODIFY] `src/config/content-types.ts`
Tidak ada perubahan struktural. Sudah mendukung 4 tipe (article, video, image, carousel).

---

### Task 2: Mock Data Layer

#### [MODIFY] `src/services/mock/ideation.ts`
- Update mock `generateAngles` agar setiap `AngleOption` membawa field `contentType`
- Tambah implementasi `searchInternalAssets` yang mengembalikan mock aset internal

#### [MODIFY] `src/services/ideation-service.ts`
- Expose method baru `searchInternalAssets`

---

### Task 3: State Management — useCreateFlow

#### [MODIFY] `src/features/create/use-create-flow.ts`

Perubahan utama:
1. `FlowStep` dari `1 | 2 | 3` → `1 | 2 | 3 | 4`
2. Tambah state baru:

```diff
+type AssetMode = "upload" | "directory" | null;
+
 export function useCreateFlow() {
   const [step, setStep] = useState<FlowStep>(1);
   // ... existing state
+  const [assetMode, setAssetMode] = useState<AssetMode>(null);
+  const [uploadedFiles, setUploadedFiles] = useState<UploadedMediaItem[]>([]);
+  const [selectedInternalAssetIds, setSelectedInternalAssetIds] = useState<string[]>([]);
```

3. Update `canAdvance`:
```diff
 const canAdvance =
   step === 1 ? topicTitle.trim().length > 0
-  : step === 2 ? angle !== null && contentType !== null
+  : step === 2 ? angle !== null
+  : step === 3 ? assetMode !== null && (
+      assetMode === "upload" ? uploadedFiles.length > 0
+      : selectedInternalAssetIds.length > 0
+    )
   : true;
```

4. `contentType` sekarang diturunkan otomatis dari `angle.contentType` (tidak perlu state terpisah).

5. Tambah methods: `setAssetMode`, `addUploadedFile`, `removeUploadedFile`, `toggleInternalAsset`.

6. Update `applyTopic` dan `applySelection` untuk juga mereset state aset.

---

### Task 4: Flow Stepper Update

#### [MODIFY] `src/features/create/flow-stepper.tsx`

```diff
 const STEPS: { n: FlowStep; label: string }[] = [
   { n: 1, label: "Insight & Topik" },
   { n: 2, label: "Angle & Format" },
-  { n: 3, label: "Draf Brief" },
+  { n: 3, label: "Kesiapan Aset" },
+  { n: 4, label: "Draf Brief" },
 ];
```

---

### Task 5: Modifikasi StepAngle

#### [MODIFY] `src/features/create/step-angle.tsx`

Perubahan:
- **Hapus section "Tipe Konten" terpisah** — format sekarang melekat pada angle card
- Setiap angle card menampilkan badge format konten (misal: 🎬 Video, 📸 Image)
- `requestSelection` cukup terima `angle` saja, `contentType` otomatis dari `angle.contentType`
- Tetap pakai pola yang sama: `<button>` dengan `aria-pressed`, `cn(...)`, `border-primary ring-1 ring-primary`

```tsx
// Contoh badge format dalam angle card (HARUS pakai token)
<Badge variant="secondary" className="text-xs">
  <Icon className="size-3.5 mr-1" aria-hidden />
  {CONTENT_TYPE_MAP[option.contentType].label}
</Badge>
```

---

### Task 6: Step Kesiapan Aset (BARU)

#### [NEW] `src/features/create/step-asset.tsx`

Komponen baru dengan 2 skenario (R8):

```
┌─────────────────────────────────────────────┐
│ SelectionSummary (topik, angle, format)     │
├─────────────────────────────────────────────┤
│ Section: "Apakah Anda punya materi?"        │
│  ┌──────────┐  ┌──────────┐                │
│  │ Sudah    │  │ Belum    │                │
│  │ punya    │  │ punya    │                │
│  └──────────┘  └──────────┘                │
├─────────────────────────────────────────────┤
│ [Jika "Sudah"] → Upload Dropzone           │
│   - Drag & drop area                       │
│   - File list dengan status                │
├─────────────────────────────────────────────┤
│ [Jika "Belum"] → Internal Asset Browser    │
│   - Search bar + category badges           │
│   - Grid asset cards (thumbnail, tags)     │
├─────────────────────────────────────────────┤
│ Nav: [← Kembali]  [Lanjut ke Brief →]     │
└─────────────────────────────────────────────┘
```

**ATURAN UI YANG HARUS DIIKUTI:**

Opsi "Sudah/Belum punya" → pakai pola selection button yang SAMA dengan topic cards:
```tsx
<button type="button" aria-pressed={selected}
  className={cn(
    "flex flex-col rounded-xl border bg-card p-4 text-left shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring",
    selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/40 hover:bg-muted/40"
  )}
>
```

Upload dropzone → `<label>` wrapper + hidden `<Input type="file">`:
```tsx
<label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/40 px-6 py-8 text-center transition-colors hover:border-primary/40 cursor-pointer">
```

File list → section standar:
```tsx
<section className="rounded-xl border border-border bg-card p-4 shadow-xs">
```

Internal Asset grid → sama dengan pola grid di `step-topic.tsx`:
```tsx
<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
  <button className={cn("rounded-xl border bg-card ...", selected ? "..." : "...")}>
```

---

### Task 7: SelectionSummary Update

#### [MODIFY] `src/features/create/selection-summary.tsx`

Tambah chip untuk informasi aset:
```diff
+<Chip label="Aset" value={assetSummary ?? null} />
```

---

### Task 8: CreateView & Brief Integration

#### [MODIFY] `src/features/create/create-view.tsx`

```diff
+import { StepAsset } from "./step-asset";

 {flow.step === 1 && <StepTopic flow={flow} />}
 {flow.step === 2 && <StepAngle flow={flow} />}
-{flow.step === 3 && <StepBrief flow={flow} brief={brief} />}
+{flow.step === 3 && <StepAsset flow={flow} />}
+{flow.step === 4 && <StepBrief flow={flow} brief={brief} />}
```

#### [MODIFY] `src/features/create/step-brief.tsx`

- Update referensi step navigasi (goToStep 3 → goToStep 3 untuk "ubah aset")
- Spacing root: `space-y-6` (saat ini salah pakai `space-y-4` di beberapa tempat — **HARUS diperbaiki**)

#### [MODIFY] `src/hooks/use-brief.ts`

- `enabled` sekarang check `flow.step === 4` (bukan 3)

---

### Task 9: Mock Internal Assets

#### [NEW] `src/services/mock/internal-assets.ts`

Data mock aset internal perusahaan:
```ts
export const MOCK_INTERNAL_ASSETS: InternalAssetItem[] = [
  {
    id: "dam-01",
    title: "Infografis Data Finansial Q3 2026",
    type: "image",
    thumbnailUrl: "https://images.unsplash.com/photo-...",
    resolution: "1920×1080",
    matchScore: 94,
    tags: ["finansial", "infografis", "data"],
    sourceDate: "2026-09-15",
  },
  // ... 7 more items
];
```

---

### Task 10: Sidebar Menu & Dashboard "Konten Brief" (Sesuai Permintaan Baru)

#### [MODIFY] `src/components/layout/app-sidebar.tsx`
- Ubah/tambah struktur sidebar untuk memuat grup "Workspace".
- Menu `Buat Konten` diganti/dipindah menjadi "Konten Brief" yang mengarah ke dashboard proyek (`/briefs`).
- Tambahkan menu turunan "Buat Gambar (TBD)" dan "Buat Video (TBD)".

```diff
+ <SidebarGroup>
+   <SidebarGroupLabel>Workspace</SidebarGroupLabel>
+   <SidebarGroupContent>
+     <SidebarMenu>
+       <SidebarMenuItem>
+         <SidebarMenuButton asChild tooltip="Konten Brief" isActive={pathname.startsWith("/briefs")}>
+           <Link href="/briefs"><FileText /><span>Konten Brief</span></Link>
+         </SidebarMenuButton>
+       </SidebarMenuItem>
+       <SidebarMenuItem>
+         <SidebarMenuButton asChild tooltip="Buat Gambar">
+           <div className="opacity-50 cursor-not-allowed"><ImageIcon /><span>Buat Gambar (TBD)</span></div>
+         </SidebarMenuButton>
+       </SidebarMenuItem>
+       <SidebarMenuItem>
+         <SidebarMenuButton asChild tooltip="Buat Video">
+           <div className="opacity-50 cursor-not-allowed"><Video /><span>Buat Video (TBD)</span></div>
+         </SidebarMenuButton>
+       </SidebarMenuItem>
+     </SidebarMenu>
+   </SidebarGroupContent>
+ </SidebarGroup>
```

#### [NEW] `src/app/(dashboard)/briefs/page.tsx` & `src/features/workspace/brief-dashboard.tsx`
Buat halaman baru sebagai dashboard utama proyek konten:
1. **Shortcut Rekomendasi Topik**: Menggunakan grid kartu seperti di Step 1 Ideation. Jika diklik, navigasi ke `/create` dengan query param/state.
2. **Button Create dari Scratch**: Tombol utama mengarah ke `/create`.
3. **List Project (Data Table)**: Tabel berisi daftar brief yang sudah dikerjakan. Kolom:
   - Topik yang dipilih
   - Angle yang dipilih
   - Format/Tipe Konten
   - Tanggal
   - Status
   - Action Button (View/Edit)
*Implementasi tabel wajib menggunakan komponen `<Table>` dari shadcn UI bawaan.*

---

## Urutan Eksekusi

| # | Task | File | Estimasi |
|---|---|---|---|
| 1 | Sidebar & Workspace Dashboard | `app-sidebar.tsx`, `briefs/page.tsx`, dll. | Sedang |
| 2 | Tipe data & config | `types/ideation.ts` | Kecil |
| 3 | Mock data layer | `services/mock/ideation.ts`, `services/mock/internal-assets.ts`, `services/ideation-service.ts` | Sedang |
| 4 | State management | `use-create-flow.ts` | Sedang |
| 5 | Flow stepper | `flow-stepper.tsx` | Kecil |
| 6 | StepAngle modifikasi | `step-angle.tsx` | Sedang |
| 7 | StepAsset (BARU) | `step-asset.tsx` | Besar |
| 8 | SelectionSummary | `selection-summary.tsx` | Kecil |
| 9 | CreateView & Brief | `create-view.tsx`, `step-brief.tsx`, `use-brief.ts` | Sedang |
| 10| Verifikasi & build | — | — |

---

## Verification Plan

### Automated Tests
```bash
npx tsc --noEmit     # Zero TypeScript errors
npm run lint          # Zero ESLint errors
npm run build         # Next.js build sukses tanpa error
```

### Manual Verification (Browser)
1. **Workspace Dashboard**: Buka menu "Konten Brief", cek daftar tabel proyek dan pastikan rekomendasi topik tampil sebagai shortcut.
2. **Flow Happy Path "Recommended"**: Klik tombol create dari scratch atau pilih topik → pilih angle (otomatis set format) → pilih "sudah punya aset" → upload file → lihat brief
3. **Flow Happy Path "Custom"**: Tulis topik sendiri → pilih angle → pilih "belum punya aset" → pilih dari DAM → lihat brief
4. **Step navigation**: Kembali ke step sebelumnya tanpa kehilangan data. Ubah topik setelah brief → dialog konfirmasi muncul
5. **State checks**: Loading skeleton, error state, empty state di setiap step
6. **UI consistency audit**: Periksa setiap elemen visual terhadap checklist anti-SLOP di atas

### UI Audit Checklist
Setelah semua task selesai, jalankan audit manual:
- [ ] Semua section pakai `rounded-xl border border-border bg-card p-4 shadow-xs`
- [ ] Semua interactive card pakai pola `cn(selected ? "border-primary ring-1 ring-primary" : "border-border hover:...")`
- [ ] Spacing root `space-y-6` konsisten di semua step
- [ ] Tidak ada hardcoded color, hanya semantic tokens
- [ ] Semua button pakai `<Button>` component
- [ ] Semua input pakai `<Input>` / `<Textarea>` component
- [ ] Tabel di dashboard menggunakan komponen `<Table>` shadcn
