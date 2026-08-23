# Sistem Monitoring Laka Digital

Sistem Monitoring Laka Digital adalah platform berbasis web yang dirancang untuk memantau dan mengelola data kecelakaan lalu lintas (Laka) secara real-time. Sistem ini menyediakan antarmuka yang efisien bagi admin, penyidik, dan pimpinan untuk melaporkan, melacak, dan menganalisis kejadian kecelakaan.

## Fitur Utama

- **Manajemen Laporan**: Meliputi pelaporan, update, dan detail insiden kecelakaan.
- **Monitoring**: Pemantauan real-time kondisi lalu lintas di tingkat Polres.
- **Manajemen Master Data**: Pengelolaan data entitas terkait seperti data MRLL, data korban, kendaraan, TKP, dan lokasi.
- **Migrasi Data**: Modul khusus untuk migrasi data historis ke sistem digital.
- **Manajemen User**: Pengelolaan akun pengguna dengan sistem otorisasi berbasis peran.
- **Rekapitulasi & Dashboard**: Visualisasi data performa penanganan kecelakaan.
- **Panduan**: Modul untuk menyajikan panduan penggunaan sistem.

## Teknologi yang Digunakan

- **Framework**: Next.js 14
- **Bahasa Pemrograman**: TypeScript
- **Styling & UI Components**: Tailwind CSS, Radix UI, Lucide React, Date-fns, React-hook-form, React-select, React-Toastify.
- **State Management**: TanStack Query (React Query).
- **Testing**: Playwright.

## Struktur Proyek

```
monitoring-laka-fe/
├── app/
│   ├── admin/              # Modul admin
│   ├── login/              # Modul autentikasi
│   ├── api/                # API routes
│   └── ...
├── components/             # Komponen UI dan fungsional
├── lib/                    # Utility functions dan API clients
├── public/                 # Aset statis
└── ...
```

## Instalasi & Setup

1. Clone repositori:
   ```bash
   git clone <repo_url>
   cd monitoring-laka-fe
   ```

2. Install dependensi:
   ```bash
   pnpm install
   ```

3. Konfigurasi environment variables:
   Buat file `.env.local` dan tambahkan variabel berikut (sesuai kebutuhan):
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
   ```

4. Jalankan development server:
   ```bash
   pnpm run dev
   ```

## Menjalankan Tes

Sistem ini menggunakan Playwright untuk E2E testing.

1. Jalankan semua tes:
   ```bash
   pnpm test
   ```

2. Jalankan tes secara interaktif:
   ```bash
   pnpm test:ui
   ```

## Deployment

Sistem ini terintegrasi dengan Vercel untuk deployment otomatis.

1. Pastikan Anda sudah login ke Vercel CLI (`vercel login`).
2. Jalankan perintah deploy:
   ```bash
   pnpm run deploy
   ```

feat: integrate TanStack Query for master data management