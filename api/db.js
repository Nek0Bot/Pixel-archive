
import 'dotenv/config'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('[DB] DATABASE_URL belum tersedia')
}

const isLocal = /localhost|127\.0\.0\.1/.test(connectionString)

export const pool = new pg.Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  keepAlive: true
})

// Error dari koneksi idle PostgreSQL
pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', {
    code: err.code,
    message: err.message
  })
})

// Fungsi untuk menguji koneksi database
export async function testDatabase() {
  const result = await pool.query(
    'SELECT NOW() AS database_time'
  )

  return result.rows[0]
}
