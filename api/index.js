import express from 'express'
import cors from 'cors'
import { pool } from './db.js'

const app = express()
app.use(cors())
app.use(express.json())

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
    rating: Number(body.rating),
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
  if (!(g.rating >= 0 && g.rating <= 5)) galat.push('Rating harus 0 sampai 5')
  if (g.image_url && !/^https?:\/\//.test(g.image_url)) galat.push('URL gambar harus diawali http:// atau https://')
  return { g, galat }
}

app.get('/api', (req, res) =>
  res.json({ nama: 'Pixel Archive API', endpoints: ['GET/POST /api/games', 'GET/PUT/DELETE /api/games/:id', 'GET /api/genres', 'GET /api/genres/:id'] })
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
    `INSERT INTO games (title, genre_id, year, developer, rating, platform, emoji, description, image_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [g.title, g.genre_id, g.year, g.developer, g.rating, g.platform, g.emoji, g.description, g.image_url]
  )
  const hasil = await pool.query(`${SELECT_GAME} WHERE id = $1`, [rows[0].id])
  res.status(201).json(hasil.rows[0])
}))

app.put('/api/games/:id', h(async (req, res) => {
  const { g, galat } = bacaGame(req.body)
  if (galat.length) return res.status(400).json({ message: galat.join('. ') })
  const { rowCount } = await pool.query(
    `UPDATE games SET title=$1, genre_id=$2, year=$3, developer=$4, rating=$5, platform=$6,
       emoji=$7, description=$8, image_url=$9 WHERE id=$10`,
    [g.title, g.genre_id, g.year, g.developer, g.rating, g.platform, g.emoji, g.description, g.image_url, Number(req.params.id) || 0]
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

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Terjadi kesalahan pada server atau database' })
})

export default app
