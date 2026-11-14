import { db, notifyQueueChanged } from './offline/db.js'
import { requireSupabase, supabase, supabaseConfigured } from './lib/supabase.js'

const online = () => typeof navigator === 'undefined' || navigator.onLine
const networkError = (error) =>
  !online() ||
  error instanceof TypeError ||
  /failed to fetch|networkerror|load failed|fetch failed/i.test(String(error?.message || ''))

const fromRow = (row) => ({ ...row, year: Number(row.year), rating: Number(row.rating), genre: row.genre_id })
// Hanya kolom tabel games yang dikirim ke Supabase (field lokal seperti _syncedId dibuang)
const KOLOM = ['title', 'developer', 'platform', 'emoji', 'description', 'image_url']
const toRow = (game) => {
  const row = { genre_id: String(game.genre), year: Number(game.year), rating: Number(game.rating) }
  for (const k of KOLOM) row[k] = game[k] ?? null
  row.image_url = row.image_url || null
  return row
}
const localId = () => -(Date.now() + Math.floor(Math.random() * 10000))

async function cachedGames() {
  const rows = await db.games.toArray()
  return rows.filter((game) => !game._syncedId)
}

async function updateTemporaryAliases(realId, game) {
  const rows = await db.games.toArray()
  const aliases = rows.filter((row) => row._syncedId === realId)
  for (const alias of aliases) {
    await db.games.put({ ...game, id: alias.id, _syncedId: realId })
  }
}

async function cachedGenres() {
  const [genres, games] = await Promise.all([db.genres.toArray(), db.games.toArray()])
  return genres.map((genre) => ({
    ...genre,
    jumlah: games.filter((game) => !game._syncedId && String(game.genre) === String(genre.id)).length
  }))
}

function filterGames(games, q = '') {
  const term = q.trim().toLocaleLowerCase('id')
  return term ? games.filter((game) => game.title.toLocaleLowerCase('id').includes(term)) : games
}

export async function getGames(q = '') {
  if (online() && supabaseConfigured) {
    try {
      const { data, error } = await requireSupabase()
        .from('games').select('*').order('id', { ascending: true })
      if (error) throw error
      const games = (data || []).map(fromRow)
      await db.games.bulkPut(games)
      // Buang cache game yang sudah dihapus di server (kecuali data lokal yang belum sinkron)
      const idServer = new Set(games.map((g) => g.id))
      const basi = (await db.games.toArray()).filter((g) => g.id > 0 && !idServer.has(g.id)).map((g) => g.id)
      if (basi.length) await db.games.bulkDelete(basi)
      return filterGames(games, q)
    } catch (error) {
      const cached = await cachedGames()
      if (cached.length) return filterGames(cached, q)
      throw error
    }
  }
  const cached = await cachedGames()
  if (!cached.length && !supabaseConfigured) {
    throw new Error('Supabase belum dikonfigurasi dan belum ada data tersimpan di perangkat.')
  }
  return filterGames(cached, q)
}

export async function getGame(id) {
  const numericId = Number(id)
  if (numericId < 0 || !online() || !supabaseConfigured) {
    const cached = await db.games.get(numericId)
    if (cached) return cached
    throw new Error('Game belum tersedia di penyimpanan perangkat. Buka aplikasi saat online terlebih dahulu.')
  }

  try {
    const { data, error } = await requireSupabase()
      .from('games').select('*').eq('id', numericId).maybeSingle()
    if (error) throw error
    if (!data) throw new Error('Game tidak ditemukan.')
    const game = fromRow(data)
    await db.games.put(game)
    return game
  } catch (error) {
    const cached = await db.games.get(numericId)
    if (cached) return cached
    throw error
  }
}

export async function getGenres() {
  if (online() && supabaseConfigured) {
    try {
      const client = requireSupabase()
      const [{ data: genres, error: genreError }, { data: games, error: gameError }] = await Promise.all([
        client.from('genres').select('*').order('nama'),
        client.from('games').select('id, genre_id')
      ])
      if (genreError) throw genreError
      if (gameError) throw gameError
      const counts = new Map()
      for (const game of games || []) counts.set(game.genre_id, (counts.get(game.genre_id) || 0) + 1)
      const result = (genres || []).map((genre) => ({ ...genre, jumlah: counts.get(genre.id) || 0 }))
      await db.genres.bulkPut(result)
      return result
    } catch (error) {
      const cached = await cachedGenres()
      if (cached.length) return cached
      throw error
    }
  }
  const cached = await cachedGenres()
  if (!cached.length) throw new Error('Data genre belum tersimpan. Hubungkan aplikasi ke internet untuk memuat data awal.')
  return cached
}

export async function getGenre(id) {
  if (online() && supabaseConfigured) {
    try {
      const client = requireSupabase()
      const [{ data: genre, error: genreError }, { data: games, error: gamesError }] = await Promise.all([
        client.from('genres').select('*').eq('id', id).maybeSingle(),
        client.from('games').select('*').eq('genre_id', id).order('id')
      ])
      if (genreError) throw genreError
      if (gamesError) throw gamesError
      if (!genre) throw new Error('Genre tidak ditemukan.')
      const mappedGames = (games || []).map(fromRow)
      await db.genres.put(genre)
      await db.games.bulkPut(mappedGames)
      return { ...genre, games: mappedGames }
    } catch (error) {
      const genre = await db.genres.get(id)
      if (genre) {
        const games = (await db.games.where('genre').equals(id).toArray()).filter((game) => !game._syncedId)
        return { ...genre, games }
      }
      throw error
    }
  }
  const genre = await db.genres.get(id)
  if (!genre) throw new Error('Genre belum tersimpan di perangkat. Buka halaman ini saat online terlebih dahulu.')
  const games = (await db.games.where('genre').equals(id).toArray()).filter((game) => !game._syncedId)
  return { ...genre, games }
}

async function addMutation(mutation) {
  await db.mutations.add({ ...mutation, createdAt: new Date().toISOString() })
  await notifyQueueChanged()
}

export async function createGame(body) {
  const payload = { ...body, year: Number(body.year), rating: Number(body.rating), genre: String(body.genre) }
  if (online() && supabaseConfigured) {
    try {
      const { data, error } = await requireSupabase()
        .from('games').insert(toRow(payload)).select('*').single()
      if (error) throw error
      const game = fromRow(data)
      await db.games.put(game)
      return game
    } catch (error) {
      if (!networkError(error)) throw error
    }
  } else if (online() && !supabaseConfigured) {
    throw new Error('Supabase belum dikonfigurasi. Periksa file .env sebelum menambahkan data.')
  }

  const id = localId()
  const game = { ...payload, id, _pending: true }
  await db.games.put(game)
  await addMutation({ type: 'create', localId: id, payload })
  return game
}

export async function updateGame(id, body) {
  const numericId = Number(id)
  const payload = { ...body, year: Number(body.year), rating: Number(body.rating), genre: String(body.genre) }

  if (numericId < 0) {
    const alias = await db.games.get(numericId)
    if (alias?._syncedId) {
      const updated = await updateGame(alias._syncedId, payload)
      const routeGame = { ...updated, id: numericId, _syncedId: alias._syncedId }
      await db.games.put(routeGame)
      return routeGame
    }
    const pendingCreate = await db.mutations.where('localId').equals(numericId).first()
    if (pendingCreate?.type === 'create') {
      await db.mutations.update(pendingCreate.queueId, { payload })
    } else {
      await addMutation({ type: 'update', gameId: numericId, localId: numericId, payload })
    }
    const game = { ...payload, id: numericId, _pending: true }
    await db.games.put(game)
    await notifyQueueChanged()
    return game
  }

  if (online() && supabaseConfigured) {
    try {
      const { data, error } = await requireSupabase()
        .from('games').update(toRow(payload)).eq('id', numericId).select('*').single()
      if (error) throw error
      const game = fromRow(data)
      await db.games.put(game)
      await updateTemporaryAliases(numericId, game)
      return game
    } catch (error) {
      if (!networkError(error)) throw error
    }
  } else if (online() && !supabaseConfigured) {
    throw new Error('Supabase belum dikonfigurasi. Periksa file .env sebelum mengubah data.')
  }

  const game = { ...payload, id: numericId, _pending: true }
  await db.games.put(game)
  await updateTemporaryAliases(numericId, game)
  await addMutation({ type: 'update', gameId: numericId, payload })
  return game
}

export async function deleteGame(id) {
  const numericId = Number(id)
  if (numericId < 0) {
    const alias = await db.games.get(numericId)
    if (alias?._syncedId) {
      await db.games.delete(numericId)
      return deleteGame(alias._syncedId)
    }
    const queued = await db.mutations.where('localId').equals(numericId).toArray()
    await db.mutations.bulkDelete(queued.map((item) => item.queueId))
    await db.games.delete(numericId)
    await notifyQueueChanged()
    return { message: 'Game lokal dihapus.' }
  }

  if (online() && supabaseConfigured) {
    try {
      const { error } = await requireSupabase().from('games').delete().eq('id', numericId)
      if (error) throw error
      await db.games.delete(numericId)
      return { message: 'Game dihapus.' }
    } catch (error) {
      if (!networkError(error)) throw error
    }
  } else if (online() && !supabaseConfigured) {
    throw new Error('Supabase belum dikonfigurasi. Periksa file .env sebelum menghapus data.')
  }

  await db.games.delete(numericId)
  const rows = await db.games.toArray()
  await db.games.bulkDelete(rows.filter((row) => row._syncedId === numericId).map((row) => row.id))
  await addMutation({ type: 'delete', gameId: numericId })
  return { message: 'Penghapusan akan disinkronkan saat online.' }
}

let syncing = false

export async function syncPendingChanges() {
  if (syncing || !online() || !supabaseConfigured) return
  syncing = true
  const idMap = new Map()

  try {
    const queue = await db.mutations.orderBy('queueId').toArray()
    for (const item of queue) {
      const client = requireSupabase()
      if (item.type === 'create') {
        const { data, error } = await client.from('games').insert(toRow(item.payload)).select('*').single()
        if (error) throw error
        const created = fromRow(data)
        idMap.set(item.localId, created.id)
        await db.games.put(created)
        await db.games.put({ ...created, id: item.localId, _syncedId: created.id })
        const later = await db.mutations.where('localId').equals(item.localId).toArray()
        for (const pending of later) {
          await db.mutations.update(pending.queueId, { gameId: created.id, localId: created.id })
        }
      } else if (item.type === 'update') {
        const realId = idMap.get(item.gameId) || item.gameId
        const { data, error } = await client.from('games').update(toRow(item.payload))
          .eq('id', realId).select('*').single()
        if (error) throw error
        const updated = fromRow(data)
        await db.games.put(updated)
        await updateTemporaryAliases(realId, updated)
      } else if (item.type === 'delete') {
        const realId = idMap.get(item.gameId) || item.gameId
        const { error } = await client.from('games').delete().eq('id', realId)
        if (error) throw error
        await db.games.delete(realId)
        const rows = await db.games.toArray()
        await db.games.bulkDelete(rows.filter((row) => row._syncedId === realId).map((row) => row.id))
      }
      await db.mutations.delete(item.queueId)
      await notifyQueueChanged()
    }
  } catch (error) {
    console.warn('Sinkronisasi tertunda:', error.message)
  } finally {
    syncing = false
    await notifyQueueChanged()
  }
}
