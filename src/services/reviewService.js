import { http, butuhOnline } from '../http.js'
import { getUser } from './userService.js'

export async function getReviews(gameId) {
  butuhOnline()
  return http(`/games/${gameId}/reviews`)
}

export async function createReview({ game_id, ...review }) {
  butuhOnline()
  return http(`/games/${game_id}/reviews`, { method: 'POST', body: review })
}

export async function deleteReview(id) {
  butuhOnline()
  await http(`/reviews/${id}?user_id=${encodeURIComponent(getUser().id)}`, { method: 'DELETE' })
}
