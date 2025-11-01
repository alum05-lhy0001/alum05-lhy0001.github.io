const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')

// Config via env
const DIR = process.env.SEED_DIR || path.resolve(__dirname, '..', 'data', 'ebooks')
const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_USER = process.env.DB_USER || 'root'
const DB_PASSWORD = process.env.DB_PASSWORD || 'G0100904dM!'
const DB_NAME = process.env.DB_NAME || 'itEBooks_db'
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306

async function run() {
  if (!fs.existsSync(DIR)) {
    console.error('Seed directory not found:', DIR)
    process.exit(1)
  }

  const files = fs.readdirSync(DIR).filter(f => f.toLowerCase().endsWith('.pdf'))
  if (files.length === 0) {
    console.log('No PDF files found in', DIR)
    return
  }

  const pool = mysql.createPool({ host: DB_HOST, user: DB_USER, password: DB_PASSWORD, database: DB_NAME, port: DB_PORT, connectionLimit: 5 })

  for (const file of files) {
    const filePath = path.join(DIR, file)
    const title = path.basename(file, path.extname(file))
    const data = fs.readFileSync(filePath)
    try {
      // Insert or update if title already exists (assumes title uniqueness)
      await pool.query(
        `INSERT INTO ebooks (title, pdf_data) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE pdf_data = VALUES(pdf_data)`,
        [title, data]
      )
      console.log('Seeded', title)
    } catch (err) {
      console.error('Error inserting', title, err.message)
    }
  }

  await pool.end()
  console.log('Seeding complete')
}

run().catch(err => { console.error(err); process.exit(1) })
