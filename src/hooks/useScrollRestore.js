import { useEffect, useLayoutEffect, useRef } from 'react'

// Simpan posisi scroll saat halaman ditinggalkan, lalu pulihkan setelah data siap (siap = true).
export default function useScrollRestore(key, siap) {
  const sudah = useRef(false)

  // Layout effect: cleanup berjalan sebelum elemen dilepas dari DOM, jadi scrollY masih benar
  useLayoutEffect(() => () => {
    try { sessionStorage.setItem(key, String(window.scrollY)) } catch { /* abaikan */ }
  }, [key])

  useEffect(() => {
    if (!siap || sudah.current) return
    sudah.current = true
    const y = Number(sessionStorage.getItem(key)) || 0
    if (y > 0) requestAnimationFrame(() => window.scrollTo(0, y))
  }, [siap, key])
}
