// Draf form tambah game disimpan di localStorage supaya tidak hilang saat halaman tertutup.
const KEY = 'pixel_archive_draft_game'

export const loadDraft = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null }
}
export const saveDraft = (form) => localStorage.setItem(KEY, JSON.stringify(form))
export const clearDraft = () => localStorage.removeItem(KEY)
