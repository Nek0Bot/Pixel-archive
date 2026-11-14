// Favorit disimpan di localStorage agar tetap berfungsi saat offline.
const KEY = 'pixel_archive_favorites'

export function getFavoriteIds() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function toggleFavorite(id) {
  const ids = getFavoriteIds()
  const baru = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
  localStorage.setItem(KEY, JSON.stringify(baru))
  window.dispatchEvent(new Event('pixel-archive-favorites'))
  return baru
}
