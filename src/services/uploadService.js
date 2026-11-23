import { http, butuhOnline } from '../http.js'

const TIPE = ['image/jpeg', 'image/png', 'image/webp']
const MAKS = 4 * 1024 * 1024 // 4 MB

export function validasiGambar(file) {
  if (!TIPE.includes(file.type)) return 'Format harus JPG, PNG, atau WebP.'
  if (file.size > MAKS) return 'Ukuran gambar maksimal 4 MB.'
  return ''
}

// Kirim gambar ke Express API; server yang meneruskannya ke Supabase Storage dan mengembalikan URL publik.
export async function uploadGambar(file) {
  const pesan = validasiGambar(file)
  if (pesan) throw new Error(pesan)
  butuhOnline()
  const { url } = await http('/upload', { method: 'POST', raw: file, headers: { 'Content-Type': file.type } })
  return url
}
