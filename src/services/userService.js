// Identitas pengguna anonim: disimpan di localStorage (tanpa login).
const KEY = 'pixel_archive_user'

const buatId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID()) ||
  `u-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

export function getUser() {
  try {
    const mentah = localStorage.getItem(KEY)
    if (mentah) return JSON.parse(mentah)
  } catch { /* abaikan data rusak */ }
  const baru = { id: buatId(), name: '' }
  localStorage.setItem(KEY, JSON.stringify(baru))
  return baru
}

export function saveUser(patch) {
  const user = { ...getUser(), ...patch }
  localStorage.setItem(KEY, JSON.stringify(user))
  return user
}
