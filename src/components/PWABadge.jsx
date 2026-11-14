import { useEffect, useState } from 'react'

// Tombol pasang aplikasi (event beforeinstallprompt). Hilang otomatis setelah terpasang.
export default function PWABadge() {
  const [prompt, setPrompt] = useState(null)

  useEffect(() => {
    const siap = (e) => { e.preventDefault(); setPrompt(e) }
    const terpasang = () => setPrompt(null)
    window.addEventListener('beforeinstallprompt', siap)
    window.addEventListener('appinstalled', terpasang)
    return () => {
      window.removeEventListener('beforeinstallprompt', siap)
      window.removeEventListener('appinstalled', terpasang)
    }
  }, [])

  if (!prompt) return null

  async function pasang() {
    prompt.prompt()
    await prompt.userChoice
    setPrompt(null)
  }

  return (
    <div className="pwa-badge" role="region" aria-label="Pasang aplikasi">
      <span>Pasang Pixel Archive di perangkatmu</span>
      <button className="tombol kecil" onClick={pasang}>Pasang</button>
      <button className="tautan" onClick={() => setPrompt(null)} aria-label="Tutup">✕</button>
    </div>
  )
}
