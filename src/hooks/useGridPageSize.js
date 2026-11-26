import { useEffect, useState } from 'react'

// Jumlah game per halaman mengikuti jumlah kolom .grid di styles.css supaya baris selalu penuh:
//   < 900px  : 2 kolom -> 8 game  (4 baris)
//   >= 900px : 4 kolom -> 12 game (3 baris)
//   >= 1280px: 5 kolom -> 15 game (3 baris)
const bacaUkuran = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return 8
  if (window.matchMedia('(min-width: 1280px)').matches) return 15
  if (window.matchMedia('(min-width: 900px)').matches) return 12
  return 8
}

export default function useGridPageSize() {
  const [ukuran, setUkuran] = useState(bacaUkuran)
  useEffect(() => {
    const daftar = [window.matchMedia('(min-width: 900px)'), window.matchMedia('(min-width: 1280px)')]
    const perbarui = () => setUkuran(bacaUkuran())
    daftar.forEach((m) => m.addEventListener('change', perbarui))
    return () => daftar.forEach((m) => m.removeEventListener('change', perbarui))
  }, [])
  return ukuran
}
