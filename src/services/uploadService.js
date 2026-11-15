import { clientOnline } from './supabaseGuard.js'

export const BUCKET = 'game-images'
const TIPE = ['image/jpeg', 'image/png', 'image/webp']
const MAKS = 4 * 1024 * 1024 // 4 MB

export function validasiGambar(file) {
  if (!TIPE.includes(file.type)) return 'Format harus JPG, PNG, atau WebP.'
  if (file.size > MAKS) return 'Ukuran gambar maksimal 4 MB.'
  return ''
}

// Upload ke Supabase Storage lalu kembalikan URL publik.
export async function uploadGambar(file) {
  const pesan = validasiGambar(file)
  if (pesan) throw new Error(pesan)
  const client = clientOnline()
  const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1]
  const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await client.storage.from(BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false })
  if (error) throw new Error(error.message)
  return client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
