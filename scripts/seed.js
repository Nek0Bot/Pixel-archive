import { createRequire } from 'module'
import { pool } from '../api/db.js'

const require = createRequire(import.meta.url)
const games = require('../data/games.json')
const genres = require('../data/genres.json')

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS genres (
      id TEXT PRIMARY KEY, nama TEXT NOT NULL, emoji TEXT, warna TEXT, deskripsi TEXT
    );
    CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      genre_id TEXT NOT NULL REFERENCES genres(id),
      year INT NOT NULL,
      developer TEXT NOT NULL,
      rating NUMERIC(2,1) NOT NULL DEFAULT 0,
      platform TEXT,
      emoji TEXT DEFAULT '🎮',
      description TEXT,
      image_url TEXT
    );`)

  for (const g of genres) {
    await pool.query(
      `INSERT INTO genres (id, nama, emoji, warna, deskripsi) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO UPDATE SET nama=$2, emoji=$3, warna=$4, deskripsi=$5`,
      [g.id, g.nama, g.emoji, g.warna, g.deskripsi]
    )
  }

  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM games')
  if (rows[0].n === 0) {
    for (const g of games) {
      await pool.query(
        `INSERT INTO games (id, title, genre_id, year, developer, rating, platform, emoji, description)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [g.id, g.title, g.genre, g.year, g.developer, g.rating, g.platform, g.emoji, g.description]
      )
    }
    await pool.query(`SELECT setval(pg_get_serial_sequence('games','id'), (SELECT MAX(id) FROM games))`)
    console.log(`Seed selesai: ${games.length} game.`)
  } else {
    console.log('Tabel games sudah berisi data, seed game dilewati.')
  }
  await pool.end()
}

main().catch((e) => { console.error(e.message); process.exit(1) })
