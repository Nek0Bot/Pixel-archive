import { clientOnline, cek } from './supabaseGuard.js'

export async function getQuotes(gameId) {
  return cek(await clientOnline().from('quotes').select('*')
    .eq('game_id', gameId).order('created_at', { ascending: false }))
}

export async function createQuote(quote) {
  return cek(await clientOnline().from('quotes').insert(quote).select('*').single())
}

export async function deleteQuote(id) {
  cek(await clientOnline().from('quotes').delete().eq('id', id))
}
