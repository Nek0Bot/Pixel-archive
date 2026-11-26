import express from 'express'
import cors from 'cors'
import { pool } from './db.js'
import { simpanGambar } from './storage.js'

const app = express()
app.use(cors())
app.use(express.json())


// Database health check
app.get('/api/health/db', async (req, res) => {
  try {
    const result = await testDatabase()

    res.json({
      status: 'connected',
      database: 'PostgreSQL',
      time: result.database_time
    })
  } catch (err) {
    console.error('[DB Health Check]', {
      code: err.code,
      message: err.message
    })

    res.status(503).json({
      status: 'disconnected',
      message: 'Database connection failed',
      code: err.code || 'UNKNOWN'
    })
  }
})

// Pemeriksaan skema: menunjukkan tabel, kolom, dan trigger yang belum ada di database yang dipakai server
const SKEMA = {
  genres: ['id', 'nama', 'emoji', 'warna', 'deskripsi'],
  games: ['id', 'title', 'genre_id', 'year', 'developer', 'rating', 'platform', 'emoji', 'description', 'image_url'],
  reviews: ['id', 'game_id', 'user_id', 'reviewer_name', 'rating', 'comment', 'created_at'],
  quotes: ['id', 'game_id', 'kind', 'content', 'source', 'created_at'],
  activity_log: ['id', 'kind', 'game_id', 'game_title', 'detail', 'created_at']
}
const TRIGGER = ['trg_refresh_game_rating', 'trg_log_game_change', 'trg_log_review_added', 'trg_log_quote_added']

app.get('/api/health/schema', (req, res, next) => (async () => {
  const kol = await pool.query(
    `SELECT table_name, column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = ANY($1)`, [Object.keys(SKEMA)])
  const ada = {}
  for (const r of kol.rows) (ada[r.table_name] ||= new Set()).add(r.column_name)
  const kurang = []
  for (const [tabel, cols] of Object.entries(SKEMA)) {
    if (!ada[tabel]) { kurang.push(`tabel ${tabel} tidak ada`); continue }
    for (const c of cols) if (!ada[tabel].has(c)) kurang.push(`kolom ${tabel}.${c} tidak ada`)
  }
  const trg = await pool.query('SELECT tgname FROM pg_trigger WHERE NOT tgisinternal AND tgname = ANY($1)', [TRIGGER])
  const adaTrg = new Set(trg.rows.map((r) => r.tgname))
  for (const t of TRIGGER) if (!adaTrg.has(t)) kurang.push(`trigger ${t} tidak ada`)
  const db = await pool.query('SELECT current_database() AS nama')
  res.status(kurang.length ? 503 : 200).json({ database: db.rows[0].nama, status: kurang.length ? 'tidak lengkap' : 'lengkap', kurang })
})().catch(next))

const SELECT_GAME = `SELECT id, title, genre_id AS genre, year, developer, rating::float AS rating,
  platform, emoji, description, image_url FROM games`

// Bungkus handler async agar error masuk ke error handler
const h = (fn) => (req, res, next) => fn(req, res).catch(next)

// Validasi dan rapikan body
function bacaGame(body) {
  const g = {
    title: String(body.title || '').trim(),
    genre_id: String(body.genre || '').trim(),
    year: Number(body.year),
    developer: String(body.developer || '').trim(),
    platform: String(body.platform || '').trim(),
    emoji: String(body.emoji || '🎮').trim().slice(0, 8),
    description: String(body.description || '').trim(),
    image_url: String(body.image_url || '').trim() || null
  }
  const galat = []
  if (!g.title) galat.push('Judul wajib diisi')
  if (!g.genre_id) galat.push('Genre wajib dipilih')
  if (!Number.isInteger(g.year) || g.year < 1970 || g.year > 2100) galat.push('Tahun rilis tidak valid')
  if (!g.developer) galat.push('Pengembang wajib diisi')
  if (g.image_url && !/^https?:\/\//.test(g.image_url)) galat.push('URL gambar harus diawali http:// atau https://')
  return { g, galat }
}

app.get('/api', (req, res) =>
  res.json({ nama: 'Pixel Archive API', endpoints: ['GET/POST /api/games', 'GET/PUT/DELETE /api/games/:id', 'GET/POST /api/games/:id/reviews', 'DELETE /api/reviews/:id', 'GET/POST /api/games/:id/quotes', 'DELETE /api/quotes/:id', 'GET /api/genres', 'GET /api/genres/:id', 'GET /api/activity', 'POST /api/upload'] })
)

app.get('/api/games', h(async (req, res) => {
  const { q, genre } = req.query
  const where = []
  const val = []
  if (q) { val.push(`%${q}%`); where.push(`title ILIKE $${val.length}`) }
  if (genre) { val.push(genre); where.push(`genre_id = $${val.length}`) }
  const sql = `${SELECT_GAME} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id`
  res.json((await pool.query(sql, val)).rows)
}))

app.get('/api/games/:id', h(async (req, res) => {
  const { rows } = await pool.query(`${SELECT_GAME} WHERE id = $1`, [Number(req.params.id) || 0])
  if (!rows[0]) return res.status(404).json({ message: 'Game tidak ditemukan' })
  res.json(rows[0])
}))

app.post('/api/games', h(async (req, res) => {
  const { g, galat } = bacaGame(req.body)
  if (galat.length) return res.status(400).json({ message: galat.join('. ') })
  const { rows } = await pool.query(
    `INSERT INTO games (title, genre_id, year, developer, platform, emoji, description, image_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [g.title, g.genre_id, g.year, g.developer, g.platform, g.emoji, g.description, g.image_url]
  )
  const hasil = await pool.query(`${SELECT_GAME} WHERE id = $1`, [rows[0].id])
  res.status(201).json(hasil.rows[0])
}))

app.put('/api/games/:id', h(async (req, res) => {
  const { g, galat } = bacaGame(req.body)
  if (galat.length) return res.status(400).json({ message: galat.join('. ') })
  const { rowCount } = await pool.query(
    `UPDATE games SET title=$1, genre_id=$2, year=$3, developer=$4, platform=$5,
       emoji=$6, description=$7, image_url=$8 WHERE id=$9`,
    [g.title, g.genre_id, g.year, g.developer, g.platform, g.emoji, g.description, g.image_url, Number(req.params.id) || 0]
  )
  if (!rowCount) return res.status(404).json({ message: 'Game tidak ditemukan' })
  const hasil = await pool.query(`${SELECT_GAME} WHERE id = $1`, [Number(req.params.id)])
  res.json(hasil.rows[0])
}))

app.delete('/api/games/:id', h(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM games WHERE id = $1', [Number(req.params.id) || 0])
  if (!rowCount) return res.status(404).json({ message: 'Game tidak ditemukan' })
  res.json({ message: 'Game dihapus' })
}))

app.get('/api/genres', h(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT g.id, g.nama, g.emoji, g.warna, g.deskripsi, COUNT(x.id)::int AS jumlah
     FROM genres g LEFT JOIN games x ON x.genre_id = g.id GROUP BY g.id ORDER BY g.nama`
  )
  res.json(rows)
}))

app.get('/api/genres/:id', h(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM genres WHERE id = $1', [req.params.id])
  if (!rows[0]) return res.status(404).json({ message: 'Genre tidak ditemukan' })
  const games = await pool.query(`${SELECT_GAME} WHERE genre_id = $1 ORDER BY id`, [req.params.id])
  res.json({ ...rows[0], games: games.rows })
}))


// ---------- Review ----------
const idGame = (req) => Number(req.params.id) || 0

app.get('/api/games/:id/reviews', h(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM reviews WHERE game_id = $1 ORDER BY created_at DESC', [idGame(req)])
  res.json(rows)
}))

app.post('/api/games/:id/reviews', h(async (req, res) => {
  const b = req.body || {}
  const rating = Number(b.rating)
  const comment = String(b.comment || '').trim().slice(0, 500)
  const galat = []
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) galat.push('Rating harus 1 sampai 5')
  if (!comment) galat.push('Komentar wajib diisi')
  if (galat.length) return res.status(400).json({ message: galat.join('. ') })
  const { rows } = await pool.query(
    `INSERT INTO reviews (game_id, reviewer_name, rating, comment, user_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [idGame(req), String(b.reviewer_name || '').trim().slice(0, 40) || 'Anonymous', rating, comment, String(b.user_id || '') || null]
  )
  res.status(201).json(rows[0])
}))

// Hanya pemilik review (user_id anonim dari klien) yang boleh menghapus
app.delete('/api/reviews/:id', h(async (req, res) => {
  const userId = String(req.query.user_id || '')
  const { rowCount } = await pool.query('DELETE FROM reviews WHERE id = $1 AND user_id = $2', [Number(req.params.id) || 0, userId])
  if (!rowCount) return res.status(404).json({ message: 'Review tidak ditemukan atau bukan milik Anda' })
  res.json({ message: 'Review dihapus' })
}))

// ---------- Quote dan momen ----------
app.get('/api/games/:id/quotes', h(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM quotes WHERE game_id = $1 ORDER BY created_at DESC', [idGame(req)])
  res.json(rows)
}))

app.post('/api/games/:id/quotes', h(async (req, res) => {
  const b = req.body || {}
  const kind = b.kind === 'momen' ? 'momen' : b.kind === 'quote' ? 'quote' : ''
  const content = String(b.content || '').trim().slice(0, 600)
  const galat = []
  if (!kind) galat.push('Jenis harus quote atau momen')
  if (!content) galat.push('Isi wajib diisi')
  if (galat.length) return res.status(400).json({ message: galat.join('. ') })
  const { rows } = await pool.query(
    'INSERT INTO quotes (game_id, kind, content, source) VALUES ($1,$2,$3,$4) RETURNING *',
    [idGame(req), kind, content, String(b.source || '').trim().slice(0, 80) || null]
  )
  res.status(201).json(rows[0])
}))

app.delete('/api/quotes/:id', h(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM quotes WHERE id = $1', [Number(req.params.id) || 0])
  if (!rowCount) return res.status(404).json({ message: 'Quote tidak ditemukan' })
  res.json({ message: 'Quote dihapus' })
}))

// ---------- Aktivitas (diisi otomatis oleh trigger database) ----------
app.get('/api/activity', h(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200)
  const { rows } = await pool.query('SELECT * FROM activity_log ORDER BY created_at DESC LIMIT $1', [limit])
  res.json(rows)
}))

// ---------- Upload cover (diteruskan ke Supabase Storage oleh server) ----------
const TIPE_GAMBAR = ['image/jpeg', 'image/png', 'image/webp']
app.post('/api/upload', express.raw({ type: TIPE_GAMBAR, limit: '4mb' }), h(async (req, res) => {
  if (!Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ message: 'Format harus JPG, PNG, atau WebP.' })
  res.status(201).json({ url: await simpanGambar(req.body, req.headers['content-type'].split(';')[0]) })
}))

app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Ukuran gambar maksimal 4 MB.' })
  if (err.status && err.status !== 500) return res.status(err.status).json({ message: err.message })
  if (err.code === '23503') return res.status(404).json({ message: 'Data induk (game atau genre) tidak ditemukan' })
    console.error(err)
  const kode = err.code ? ` (kode ${err.code})` : ''
  res.status(500).json({ message: `Terjadi kesalahan pada server atau database${kode}` })
})

export default app
