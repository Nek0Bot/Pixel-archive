import { clientOnline, cek } from './supabaseGuard.js'

const KEY = 'pixel_archive_activity_cache'

// Ambil 50 aktivitas terbaru. Saat offline atau gagal, tampilkan salinan terakhir dari localStorage.
export async function getActivity(limit = 50) {
  try {
    const data = cek(await clientOnline().from('activity_log').select('*')
      .order('created_at', { ascending: false }).limit(limit))
    try { localStorage.setItem(KEY, JSON.stringify(data)) } catch { /* penyimpanan penuh */ }
    return { items: data, dariCache: false }
  } catch (err) {
    try {
      const cache = JSON.parse(localStorage.getItem(KEY))
      if (Array.isArray(cache)) return { items: cache, dariCache: true }
    } catch { /* cache rusak */ }
    throw err
  }
}
