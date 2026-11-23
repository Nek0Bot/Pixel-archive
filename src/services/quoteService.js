import { http, butuhOnline } from '../http.js'

export async function getQuotes(gameId) {
  butuhOnline()
  return http(`/games/${gameId}/quotes`)
}

export async function createQuote({ game_id, ...quote }) {
  butuhOnline()
  return http(`/games/${game_id}/quotes`, { method: 'POST', body: quote })
}

export async function deleteQuote(id) {
  butuhOnline()
  await http(`/quotes/${id}`, { method: 'DELETE' })
}
