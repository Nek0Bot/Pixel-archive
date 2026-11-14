import useRemoteList from './useRemoteList.js'
import { createQuote, deleteQuote, getQuotes } from '../services/quoteService.js'

export const useQuotes = (gameId) => useRemoteList(gameId, getQuotes, createQuote, deleteQuote)
