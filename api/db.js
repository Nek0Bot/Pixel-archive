import 'dotenv/config'
import pg from 'pg'

let pool_

// Koneksi dibuat saat pertama kali dibutuhkan (bukan saat file dimuat), sehingga
// DATABASE_URL yang belum diatur tidak membuat seluruh fungsi gagal dimuat (error 500 di Vercel).
// Yang terjadi: endpoint yang butuh database membalas 503 dengan pesan yang jelas.
function getPool() {
  if (pool_) return pool_
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw Object.assign(new Error('DATABASE_URL belum diatur pada environment server'), { status: 503 })
  }
  const isLocal = /localhost|127\.0\.0\.1/.test(connectionString)
  pool_ = new pg.Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    keepAlive: true
  })
  // Error dari koneksi idle PostgreSQL
  pool_.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', { code: err.code, message: err.message })
  })
  return pool_
}

// Antarmuka sama seperti sebelumnya: pool.query(...)
export const pool = { query: (...args) => getPool().query(...args) }

// Fungsi untuk menguji koneksi database
export async function testDatabase() {
  const result = await pool.query('SELECT NOW() AS database_time')
  return result.rows[0]
}