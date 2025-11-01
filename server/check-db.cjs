const mysql = require('mysql2/promise')

const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_USER = process.env.DB_USER || 'root'
const DB_PASSWORD = process.env.DB_PASSWORD || ''
const DB_NAME = process.env.DB_NAME || 'itEBooks_db'
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306

async function check() {
  console.log('Checking DB connection with:')
  console.log(`  host=${DB_HOST} user=${DB_USER} database=${DB_NAME} port=${DB_PORT}`)

  let pool
  try {
    pool = mysql.createPool({ host: DB_HOST, user: DB_USER, password: DB_PASSWORD, database: DB_NAME, port: DB_PORT, connectionLimit: 2 })
    const [rows] = await pool.query('SELECT 1 AS ok')
    console.log('Connection test query succeeded:', rows)

    // Try a small query against expected table
    try {
      const [ebooks] = await pool.query('SELECT id, title FROM ebooks LIMIT 5')
      console.log('ebooks sample rows:', ebooks)
    } catch (innerErr) {
      console.error('Query against `ebooks` failed:')
      console.error(innerErr && innerErr.code, innerErr && innerErr.message)
    }
  } catch (err) {
    console.error('Database connection failed:')
    console.error('Error code:', err && err.code)
    console.error('Error message:', err && err.message)
    if (err && err.stack) console.error(err.stack)
    process.exitCode = 1
  } finally {
    try { if (pool) await pool.end() } catch (e) { /* ignore */ }
  }
}

check()
