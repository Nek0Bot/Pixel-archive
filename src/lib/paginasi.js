// Logika paginasi murni (tanpa React) agar mudah diuji dan dipakai ulang.

// Jumlah halaman minimal 1, walau datanya kosong.
export const totalHalaman = (total, perHalaman) => Math.max(1, Math.ceil(total / perHalaman))

// Menjepit nomor halaman ke rentang 1..totalHalaman (nilai aneh dari penyimpanan dianggap 1).
export const jepit = (halaman, total, perHalaman) =>
  Math.min(Math.max(1, Math.floor(Number(halaman)) || 1), totalHalaman(total, perHalaman))

// Daftar tombol nomor yang ditampilkan, mis. [1, '…', 4, 5, 6, '…', 12].
// Selalu memuat halaman pertama, terakhir, dan halaman aktif beserta tetangganya.
export function daftarHalaman(sekarang, total) {
  const wajib = [1, total, sekarang - 1, sekarang, sekarang + 1]
  const urut = [...new Set(wajib)].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)
  const hasil = []
  urut.forEach((n, i) => {
    if (i > 0 && n - urut[i - 1] > 1) hasil.push('…')
    hasil.push(n)
  })
  return hasil
}
