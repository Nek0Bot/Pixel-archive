# Pixel Archive

Katalog game oleh para gamer. Telusuri game berdasarkan judul atau genre, simpan favorit, tulis review, catat quote atau momen, dan lihat aktivitas terbaru. Aplikasi berbentuk PWA yang bisa dipasang dan tetap berjalan saat offline.

Versi saat ini: **1.2.2** (lihat [CHANGELOG.md](CHANGELOG.md)).
Proyek Tugas Akhir Praktikum PPB Ganjil 2026.

## Fitur
- Daftar game dengan pencarian, filter genre, dan pengurutan (tersimpan saat berpindah halaman)
- CRUD game dengan upload cover ke Supabase Storage (maks 4 MB)
- Review dan rating (rata-rata dihitung otomatis oleh database), quote dan momen
- Favorit, tema terang dan gelap, tab Aktivitas (log otomatis dari trigger database)
- PWA: service worker manual, bisa dipasang, cache data dan antrean perubahan offline (IndexedDB)

## Teknologi
React 18, Vite, React Router, Supabase (PostgreSQL, Storage), Dexie (IndexedDB), vite-plugin-pwa (manifest dan injeksi daftar file), service worker manual di `src/sw.js`.

## Struktur folder
```
src/
  pages/         halaman (Home, GameDetail, GameForm, Genres, GenreDetail, Favorites, Activity, Profile)
  components/    komponen UI (Cover, GameCard, GenreFilter, ReviewSection, QuoteSection, FormModal, ...)
  services/      akses data ke Supabase (review, quote, upload, aktivitas) dan localStorage (favorit, user, draf)
  hooks/         custom hooks (useFavorites, useReviews, useQuotes, useTheme, usePersistedState, ...)
  offline/       database lokal Dexie dan antrean sinkronisasi
  lib/           klien Supabase dan helper rating
  sw.js          service worker manual
supabase/        file SQL bernomor (jalankan berurutan)
api/, server.js  API Express lama (opsional, tidak dipakai frontend)
```

## Menjalankan
```
npm install
```
Buat file `.env` di root (jangan di-commit):
```
VITE_SUPABASE_URL=https://PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```
```
npm run dev       # mode pengembangan (service worker tidak aktif)
npm run build     # build produksi
npm run preview   # uji build produksi, termasuk PWA dan offline
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
2. Tambahkan environment variable `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Deploy ulang setiap kali variabel berubah (nilainya ditanam saat build).

## Catatan keamanan
Aplikasi tidak memakai login, sehingga policy RLS memberi akses baca dan tulis kepada role `anon`. Ini sesuai untuk tugas atau demo, bukan untuk produksi. Untuk produksi gunakan Supabase Auth dengan policy per pengguna. Jangan pernah memasukkan `service_role` key ke frontend atau repository.
