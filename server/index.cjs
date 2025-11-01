const express = require('express')
const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 4000

// DB connection settings - use env vars in production
const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_USER = process.env.DB_USER || 'root'
const DB_PASSWORD = process.env.DB_PASSWORD || ''
const DB_NAME = process.env.DB_NAME || 'itEBooks_db'
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
})

// If a built frontend exists, serve it so the server can host both API and frontend
try {
  const distDir = path.resolve(__dirname, '..', 'dist')
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir))
    // For any non-API route, serve index.html (SPA fallback)
    // Use middleware instead of a wildcard route to avoid path-to-regexp issues
    app.use((req, res, next) => {
      if (req.path && req.path.startsWith('/api/')) return next()
      // If the request looks like a navigation request (no file extension), serve index.html
      const hasExtension = path.extname(req.path || '') !== ''
      if (!hasExtension) {
        return res.sendFile(path.join(distDir, 'index.html'))
      }
      next()
    })
  }
} catch (e) {
  console.error('Error configuring static frontend serving:', e && e.message)
}

// quick CORS helper for dev
// quick CORS helper for dev - allow x-api-key header to be sent from frontend
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key')
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

app.get('/api/ebooks', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, title FROM ebooks ORDER BY id')
    // add download_url so clients can link directly
    const host = req.get('host')
    const proto = req.protocol
    const withUrls = rows.map(r => ({ ...r, download_url: `${proto}://${host}/api/ebooks/${r.id}/download` }))
    return res.json(withUrls)
  } catch (err) {
    // DB unavailable — fall back to filesystem listing in data/ebooks
    console.error('DB list error, falling back to filesystem:', err && err.message)
    try {
      const DIR = path.resolve(__dirname, '..', 'data', 'ebooks')
      if (!fs.existsSync(DIR)) return res.json([])
      const files = fs.readdirSync(DIR).filter(f => f.toLowerCase().endsWith('.pdf'))
      const host = req.get('host')
      const proto = req.protocol
      const rows = files.map((f, i) => ({ id: i + 1, title: path.basename(f, path.extname(f)), download_url: `${proto}://${host}/api/ebooks/${i + 1}/download`, filename: f }))
      return res.json(rows)
    } catch (fsErr) {
      console.error('Filesystem fallback failed:', fsErr && fsErr.message)
      return res.status(500).json({ error: 'database error' })
    }
  }
})

// Middleware to require API key if configured
const API_KEY = process.env.API_KEY || ''
function requireApiKey(req, res, next) {
  if (!API_KEY) return next() // no key configured - allow
  const incoming = req.get('x-api-key') || req.query.key || ''
  if (incoming === API_KEY) return next()
  return res.status(401).json({ error: 'missing or invalid API key' })
}

app.get('/api/ebooks/:id/download', async (req, res) => {
  const id = req.params.id
  const preview = req.query.preview === '1' || req.query.preview === 'true'
  try {
    const [rows] = await pool.query('SELECT pdf_data, title FROM ebooks WHERE id = ?', [id])
    if (!rows || rows.length === 0) return res.status(404).send('Not found')

    const row = rows[0]
    const buffer = row.pdf_data
    const title = row.title || `ebook-${id}`

    res.setHeader('Content-Type', 'application/pdf')
    // sanitize filename
    const safeName = title.replace(/[^a-z0-9_.-]/gi, '_')
    const dispositionType = preview ? 'inline' : 'attachment'
    res.setHeader('Content-Disposition', `${dispositionType}; filename="${safeName}.pdf"`)
    res.send(buffer)
  } catch (err) {
    console.error('DB download error, attempting filesystem fallback:', err && err.message)
    // fallback to filesystem: map numeric id to file list
    try {
      const DIR = path.resolve(__dirname, '..', 'data', 'ebooks')
      if (!fs.existsSync(DIR)) return res.status(404).send('Not found')
      const files = fs.readdirSync(DIR).filter(f => f.toLowerCase().endsWith('.pdf'))
      const index = Number(id) - 1
      if (Number.isNaN(index) || index < 0 || index >= files.length) return res.status(404).send('Not found')
      const filePath = path.join(DIR, files[index])
      const title = path.basename(files[index], path.extname(files[index]))
      res.setHeader('Content-Type', 'application/pdf')
      const safeName = title.replace(/[^a-z0-9_.-]/gi, '_')
      const dispositionType = preview ? 'inline' : 'attachment'
      res.setHeader('Content-Disposition', `${dispositionType}; filename="${safeName}.pdf"`)
      const stream = fs.createReadStream(filePath)
      stream.on('error', e => { console.error('stream error', e); res.status(500).send('Server error') })
      stream.pipe(res)
    } catch (fsErr) {
      console.error('Filesystem download fallback failed:', fsErr && fsErr.message)
      res.status(500).send('Server error')
    }
  }
})

// filename-based download endpoint: /api/ebooks/download/:filename
app.get('/api/ebooks/download/:filename', (req, res) => {
  try {
    const raw = req.params.filename || ''
    // sanitize filename to avoid path traversal
    const safe = path.basename(raw)
    if (!safe.toLowerCase().endsWith('.pdf')) return res.status(400).send('Invalid filename')
    const DIR = path.resolve(__dirname, '..', 'data', 'ebooks')
    const filePath = path.join(DIR, safe)
    if (!fs.existsSync(filePath)) return res.status(404).send('Not found')
    const title = path.basename(safe, path.extname(safe))
    res.setHeader('Content-Type', 'application/pdf')
    const dispositionType = req.query.preview === '1' || req.query.preview === 'true' ? 'inline' : 'attachment'
    const safeName = title.replace(/[^a-z0-9_.-]/gi, '_')
    res.setHeader('Content-Disposition', `${dispositionType}; filename="${safeName}.pdf"`)
    const stream = fs.createReadStream(filePath)
    stream.on('error', e => { console.error('stream error', e); res.status(500).send('Server error') })
    stream.pipe(res)
  } catch (e) {
    console.error('filename download failed', e && e.message)
    res.status(500).send('Server error')
  }
})

app.listen(PORT, () => {
  console.log(`Ebooks server listening on http://localhost:${PORT}`)
})
