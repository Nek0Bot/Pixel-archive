import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

// Kunci Supabase hanya dipakai di server (tidak pernah dikirim ke browser).
// Disarankan memakai SUPABASE_SERVICE_ROLE_KEY; jika tidak ada, dipakai publishable key
// (butuh policy upload untuk role anon pada bucket).
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const BUCKET = 'game-images'
export const storageConfigured = Boolean(url && key)
const client = storageConfigured ? createClient(url, key, { auth: { persistSession: false } }) : null

export async function simpanGambar(buffer, contentType) {
  if (!client) throw Object.assign(new Error('Storage belum dikonfigurasi di server (SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY).'), { status: 503 })
  const ext = contentType === 'image/jpeg' ? 'jpg' : contentType.split('/')[1]
  const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await client.storage.from(BUCKET)
    .upload(path, buffer, { contentType, cacheControl: '31536000', upsert: false })
  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
