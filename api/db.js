import 'dotenv/config'
import pg from 'pg'

const url = process.env.DATABASE_URL
const lokal = !url || /localhost|127\.0\.0\.1/.test(url)

export const pool = new pg.Pool({
  connectionString: url,
  ssl: lokal ? false : { rejectUnauthorized: false },
  max: 3
})
