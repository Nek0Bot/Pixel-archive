const BASE = import.meta.env.VITE_API_URL || ''

async function req(path, opsi = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opsi
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Gagal memuat data. Periksa koneksi lalu coba lagi.')
  return data
}

export const getGames = (q = '') => req(`/games${q ? `?q=${encodeURIComponent(q)}` : ''}`)
export const getGame = (id) => req(`/games/${id}`)
export const createGame = (body) => req('/games', { method: 'POST', body: JSON.stringify(body) })
export const updateGame = (id, body) => req(`/games/${id}`, { method: 'PUT', body: JSON.stringify(body) })
export const deleteGame = (id) => req(`/games/${id}`, { method: 'DELETE' })
export const getGenres = () => req('/genres')
export const getGenre = (id) => req(`/genres/${id}`)
