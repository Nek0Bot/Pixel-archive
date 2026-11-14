import { requireSupabase } from '../lib/supabase.js'

// Fitur yang langsung ke server (review, quote, upload) wajib online.
export function clientOnline() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('Fitur ini membutuhkan koneksi internet.')
  }
  return requireSupabase()
}

export function cek({ data, error }) {
  if (error) throw new Error(error.message)
  return data
}
