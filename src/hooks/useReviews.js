import useRemoteList from './useRemoteList.js'
import { createReview, deleteReview, getReviews } from '../services/reviewService.js'

export const useReviews = (gameId) => useRemoteList(gameId, getReviews, createReview, deleteReview)
