import Dexie from 'dexie'

export const db = new Dexie('pixel-archive-local')

db.version(1).stores({
  games: 'id, genre, title',
  genres: 'id, nama',
  mutations: '++queueId, type, gameId, localId'
})

export async function notifyQueueChanged() {
  window.dispatchEvent(new Event('pixel-archive-queue-change'))
}

export async function getPendingCount() {
  return db.mutations.count()
}
