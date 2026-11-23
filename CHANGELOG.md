# Riwayat Versi

Ringkasan perkembangan Pixel Archive. Nomor versi mengikuti `package.json`.

## 1.3.0
- Frontend tidak lagi memanggil Supabase langsung; semua data lewat Express API (`/api/...`)
- Endpoint baru: review, quote, aktivitas, dan upload cover (`/api/games/:id/reviews`, `/api/games/:id/quotes`, `/api/activity`, `/api/upload`)
- Upload cover diteruskan server ke Supabase Storage; kunci Supabase hanya ada di server
- Proxy `/api` pada Vite untuk dev dan preview; klien Supabase dihapus dari `src/`

## 1.2.2
- Deskripsi aplikasi diubah menjadi katalog game oleh para gamer (tidak lagi hanya indie dan retro)
- Versi aplikasi diambil dari satu sumber (`package.json`) dan ditampilkan di halaman Profil
- Penamaan dirapikan: nama paket `pixel-archive`, file SQL diberi nomor urut, dokumentasi ditambahkan

## 1.2.1
- Banner kartu di Home berukuran seragam
- Halaman detail dua kolom di layar lebar, banner mengikuti bentuk gambar dan berada di tengah
- Pencarian, filter genre, urutan, dan posisi scroll di Home tersimpan saat kembali dari halaman lain
- Batas upload gambar menjadi 4 MB

## 1.2.0
- Tab Aktivitas (activity log otomatis lewat trigger database)
- Mode gelap dan navbar bergradasi
- Rating game dihitung otomatis dari review pengguna
- Isi database berbahasa Inggris dengan deskripsi singkat, genre Rhythm

## 1.1.0
- Backend pindah ke Supabase dengan cache IndexedDB (Dexie) dan antrean sinkronisasi offline
- Service worker manual, favorit, review, quote dan momen, upload gambar, filter genre
- Komponen dan layanan dipisah (services, hooks)

## 1.0.0
- Katalog game dasar: daftar, detail, genre, profil, CRUD, API Express
