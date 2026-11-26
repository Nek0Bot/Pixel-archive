import { daftarHalaman } from '../lib/paginasi.js'

// Navigasi halaman: ‹ 1 … 4 [5] 6 … 12 ›   (dipakai Home, Favorit, Aktivitas)
// `paging` adalah objek hasil usePagination.
export default function Pagination({ paging, satuan = 'item' }) {
  const { halaman, totalHalaman, total, dari, sampai, pindah } = paging
  if (totalHalaman <= 1) return null

  return (
    <nav className="paginasi" aria-label={`Halaman daftar ${satuan}`}>
      <p className="paginasi-info" aria-live="polite">Menampilkan {dari}–{sampai} dari {total} {satuan}</p>
      <div className="paginasi-tombol">
        <button type="button" className="tombol kecil netral" onClick={() => pindah(halaman - 1)}
          disabled={halaman === 1} aria-label="Halaman sebelumnya">‹</button>
        {daftarHalaman(halaman, totalHalaman).map((n, i) =>
          n === '…' ? (
            <span key={`titik-${i}`} className="paginasi-titik" aria-hidden="true">…</span>
          ) : (
            <button key={n} type="button" className={`pill ${n === halaman ? 'aktif' : ''}`}
              onClick={() => pindah(n)} aria-label={`Halaman ${n}`}
              aria-current={n === halaman ? 'page' : undefined}>{n}</button>
          )
        )}
        <button type="button" className="tombol kecil netral" onClick={() => pindah(halaman + 1)}
          disabled={halaman === totalHalaman} aria-label="Halaman berikutnya">›</button>
      </div>
    </nav>
  )
}
