import { useCallback, useEffect, useRef } from 'react'
import usePersistedState from './usePersistedState.js'
import { jepit, totalHalaman as hitungTotal } from '../lib/paginasi.js'

// Membagi daftar menjadi halaman-halaman.
//  - key      : kunci sessionStorage, supaya halaman aktif bertahan saat pindah halaman lalu kembali
//  - resetKey : string berisi filter/pencarian/urutan; saat berubah, kembali ke halaman 1
export default function usePagination(items, perHalaman, { key, resetKey = '' }) {
  const [tersimpan, setTersimpan] = usePersistedState(key, 1)

  const total = items.length
  const jumlah = hitungTotal(total, perHalaman)
  // Halaman yang dipakai dihitung (diturunkan) dari nilai tersimpan, bukan ditimpakan ke state.
  // Jadi saat data masih dimuat (daftar kosong) halaman tersimpan tidak hilang.
  const halaman = jepit(tersimpan, total, perHalaman)

  // Filter/pencarian/urutan berubah -> halaman 1. Perubahan pertama (saat dimuat) diabaikan.
  const awal = useRef(resetKey)
  useEffect(() => {
    if (awal.current === resetKey) return
    awal.current = resetKey
    setTersimpan(1)
  }, [resetKey, setTersimpan])

  const pindah = useCallback((n) => {
    setTersimpan(jepit(n, total, perHalaman))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [setTersimpan, total, perHalaman])

  const mulai = (halaman - 1) * perHalaman
  const potong = items.slice(mulai, mulai + perHalaman)

  return {
    potong,                              // item untuk halaman aktif
    halaman,
    totalHalaman: jumlah,
    total,
    dari: total ? mulai + 1 : 0,
    sampai: mulai + potong.length,
    pindah
  }
}
