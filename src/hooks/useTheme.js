import { useEffect, useState } from 'react'

const KEY = 'pixel_archive_theme'

// Tema awal sudah dipasang oleh skrip kecil di index.html agar tidak berkedip saat dimuat.
export default function useTheme() {
  const [tema, setTema] = useState(() => document.documentElement.dataset.theme || 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = tema
    try { localStorage.setItem(KEY, tema) } catch { /* abaikan */ }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema === 'dark' ? '#05060F' : '#1B1F3B')
  }, [tema])

  return { tema, ganti: () => setTema((t) => (t === 'dark' ? 'light' : 'dark')) }
}
