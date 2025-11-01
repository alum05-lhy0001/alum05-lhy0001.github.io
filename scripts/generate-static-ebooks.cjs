#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

// This script generates a static ebooks.json from data/ebooks PDF files
// and writes it into the built dist folder. If the build used a base path
// (e.g. /path8), the JSON will be written to dist/<basePath>/ebooks.json

const projectRoot = path.resolve(__dirname, '..')
const distDir = path.join(projectRoot, 'dist')
const dataDir = path.join(projectRoot, 'data', 'ebooks')

if (!fs.existsSync(distDir)) {
  console.error('dist directory not found, please run `npm run build` first')
  process.exit(1)
}

let basePath = ''
try {
  const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')
  const m = indexHtml.match(/\/(\w[\w-]*)\/(assets|favicon|vite)\//)
  if (m && m[1]) {
    basePath = '/' + m[1]
    console.log('Detected frontend base path:', basePath)
  }
} catch (e) {
  // ignore
}

let targetDir = distDir
if (basePath) {
  // write under dist/<basePath> so it is served as /<basePath>/ebooks.json
  targetDir = path.join(distDir, basePath.replace(/^\//, ''))
}

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

let entries = []
if (fs.existsSync(dataDir)) {
  const files = fs.readdirSync(dataDir).filter(f => f.toLowerCase().endsWith('.pdf'))
  entries = files.map((f, i) => ({
    id: i + 1,
    title: path.basename(f, path.extname(f)),
    filename: f,
    // download URL relative to site root; consumers can use this relative path
    download_url: `./ebooks/${encodeURIComponent(f)}`
  }))
} else {
  console.warn('data/ebooks directory not found; generated JSON will be empty')
}

const outPath = path.join(targetDir, 'ebooks.json')
fs.writeFileSync(outPath, JSON.stringify(entries, null, 2), 'utf8')
console.log('Wrote static ebooks JSON to', outPath)

// Also ensure there is an ebooks folder under the target so static PDFs can be copied
const ebooksStaticDir = path.join(targetDir, 'ebooks')
if (!fs.existsSync(ebooksStaticDir)) {
  try { fs.mkdirSync(ebooksStaticDir, { recursive: true }) } catch (e) { /* ignore */ }
}

// Ensure index.html and vite.svg are present under the target so the NAS can serve /<basePath>/
const rootIndex = path.join(distDir, 'index.html')
const rootVite = path.join(distDir, 'vite.svg')
try {
  if (fs.existsSync(rootIndex)) {
    try {
      // Inject short-lived cache-bust query params into asset references and add no-cache meta tags
      const cacheBust = Date.now()
      let indexContent = fs.readFileSync(rootIndex, 'utf8')

      // Add no-cache meta tags to head to help clients pick up new builds
      indexContent = indexContent.replace(/<head>/i, '<head>\n<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">\n<meta http-equiv="Pragma" content="no-cache">\n<meta http-equiv="Expires" content="0">')

      // Append cache-bust query to asset URLs (script src and link href) that reference /assets/
      indexContent = indexContent.replace(/(src=\"\/?[^\"]*assets\/[^"]*)\"/gi, `$1?cb=${cacheBust}\"`)
      indexContent = indexContent.replace(/(href=\"\/?[^\"]*assets\/[^"]*)\"/gi, `$1?cb=${cacheBust}\"`)

      fs.writeFileSync(path.join(targetDir, 'index.html'), indexContent, 'utf8')
      console.log('Wrote index.html with cache-bust into', targetDir)
    } catch (e) {
      // fallback to raw copy if anything goes wrong
      try { fs.copyFileSync(rootIndex, path.join(targetDir, 'index.html')) } catch (e2) { /* ignore */ }
      console.warn('Failed to inject cache-bust into index.html, copied raw file instead')
    }
  }
  if (fs.existsSync(rootVite)) {
    try {
      fs.copyFileSync(rootVite, path.join(targetDir, 'vite.svg'))
      console.log('Copied vite.svg into', targetDir)
    } catch (e) {
      console.warn('Failed to copy vite.svg into target:', e && e.message)
    }
  }
} catch (e) {
  console.warn('Failed to copy index/vite files into target path:', e && e.message)
}

// Copy built assets into the target so asset URLs (/path/assets/...) resolve when hosted at /<basePath>/
const distAssets = path.join(distDir, 'assets')
const targetAssets = path.join(targetDir, 'assets')
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
  const entries = fs.readdirSync(src, { withFileTypes: true })
  for (const ent of entries) {
    const srcPath = path.join(src, ent.name)
    const destPath = path.join(dest, ent.name)
    if (ent.isDirectory()) {
      copyRecursive(srcPath, destPath)
    } else {
      try { fs.copyFileSync(srcPath, destPath) } catch (e) { /* ignore copy errors */ }
    }
  }
}
try {
  copyRecursive(distAssets, targetAssets)
  console.log('Copied assets into', targetAssets)
} catch (e) {
  console.warn('Failed to copy assets into target path:', e && e.message)
}

console.log('Done.')
