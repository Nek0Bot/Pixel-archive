// Satu-satunya pintu komunikasi frontend ke server: Express API (/api).
// Frontend tidak lagi memanggil Supabase secara langsung.
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export async function http(path, { method = 'GET', body, headers, raw } = {}) {
  const opt = { method, headers: { ...headers } }
  if (raw !== undefined) {
    opt.body = raw
  } else if (body !== undefined) {
    opt.headers['Content-Type'] = 'application/json'
    opt.body = JSON.stringify(body)
  }
  // Kegagalan jaringan dilempar apa adanya (TypeError) agar bisa dikenali sebagai offline
  const res = await fetch(`${BASE}/api${path}`, opt)
  let data = null
  try { data = await res.json() } catch { /* body kosong atau bukan JSON */ }
  if (!res.ok) throw new Error(data?.message || `Permintaan gagal (${res.status})`)
  return data
}

// Fitur yang langsung ke server (review, quote, upload) wajib online.
export function butuhOnline() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('Fitur ini membutuhkan koneksi internet.')
  }
}
