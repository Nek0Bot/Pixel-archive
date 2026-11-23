# Pixel Archive

Katalog game oleh para gamer. Telusuri game berdasarkan judul atau genre, simpan favorit, tulis review, catat quote atau momen, dan lihat aktivitas terbaru. Aplikasi berbentuk PWA yang bisa dipasang dan tetap berjalan saat offline.

Versi saat ini: **1.3.0** (lihat [CHANGELOG.md](CHANGELOG.md)).
Proyek Tugas Akhir Praktikum PPB Ganjil 2026.

## Fitur
- Daftar game dengan pencarian, filter genre, dan pengurutan (tersimpan saat berpindah halaman)
- CRUD game dengan upload cover ke Supabase Storage (maks 4 MB)
- Review dan rating (rata-rata dihitung otomatis oleh database), quote dan momen
- Favorit, tema terang dan gelap, tab Aktivitas (log otomatis dari trigger database)
- PWA: service worker manual, bisa dipasang, cache data dan antrean perubahan offline (IndexedDB)

## Teknologi
React 18, Vite, React Router, Express API (`api/`), Supabase (PostgreSQL, Storage), Dexie (IndexedDB), vite-plugin-pwa (manifest dan injeksi daftar file), service worker manual di `src/sw.js`.

## Struktur folder
```
src/
  pages/         halaman (Home, GameDetail, GameForm, Genres, GenreDetail, Favorites, Activity, Profile)
  components/    komponen UI (Cover, GameCard, GenreFilter, ReviewSection, QuoteSection, FormModal, ...)
  http.js        pembungkus fetch ke Express API (/api)
  services/      akses data lewat Express API (review, quote, upload, aktivitas) dan localStorage (favorit, user, draf)
  hooks/         custom hooks (useFavorites, useReviews, useQuotes, useTheme, usePersistedState, ...)
  offline/       database lokal Dexie dan antrean sinkronisasi
  lib/           helper rating
  sw.js          service worker manual
supabase/        file SQL bernomor (jalankan berurutan)
api/, server.js  API Express (games, genres, reviews, quotes, aktivitas, upload); satu-satunya akses frontend ke database
```

## Menjalankan
```
npm install
```
Buat file `.env` di root (jangan di-commit, contoh ada di `.env.example`):
```
DATABASE_URL=postgresql://postgres.PROJECT_ID:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```
Semua variabel ini hanya dibaca server Express. Frontend tidak memerlukan variabel `VITE_SUPABASE_*` lagi.
```
npm run dev       # Express (port 3001) dan Vite berjalan bersamaan; /api diproxy ke Express
npm run build     # build produksi
npm run preview   # uji build produksi (jalankan juga `npm run api` di terminal lain)
```
Service worker hanya aktif pada build produksi, jadi uji PWA dengan `build` lalu `preview`.

## Database (Supabase)
Jalankan file di folder `supabase/` pada SQL Editor secara berurutan:

| File | Isi |
|---|---|
| `00-base-schema.sql` | Tabel genres dan games beserta RLS |
| `01-reviews-quotes-storage.sql` | Tabel reviews dan quotes, bucket gambar, policy |
| `02-genres-and-rating.sql` | Daftar genre dan trigger rating otomatis |
| `03-seed-games.sql` | 14 game bawaan |
| `04-seed-franchise-games.sql` | Trails, Project Moon, dan game lainnya |
| `05-activity-log.sql` | Tabel dan trigger activity log (jalankan terakhir agar seed tidak memenuhi log) |

## Deploy (Vercel)
1. Push ke GitHub dan import repository di Vercel.
2. Tambahkan environment variable `DATABASE_URL`, `SUPABASE_URL`, dan `SUPABASE_SERVICE_ROLE_KEY`.
3. `api/index.js` berjalan sebagai Serverless Function dan `vercel.json` mengarahkan `/api/*` ke sana.

## Catatan keamanan
Aplikasi tidak memakai login, sehingga policy RLS memberi akses baca dan tulis kepada role `anon`. Ini sesuai untuk tugas atau demo, bukan untuk produksi. Untuk produksi gunakan Supabase Auth dengan policy per pengguna. `service_role` key hanya boleh ada di environment server (Vercel/`.env`), jangan pernah di frontend atau repository.
