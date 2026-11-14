import { clientOnline, cek } from './supabaseGuard.js'

export async function getReviews(gameId) {
  return cek(await clientOnline().from('reviews').select('*')
    .eq('game_id', gameId).order('created_at', { ascending: false }))
}

export async function createReview(review) {
  return cek(await clientOnline().from('reviews').insert(review).select('*').single())
}

export async function deleteReview(id) {
  cek(await clientOnline().from('reviews').delete().eq('id', id))
}
