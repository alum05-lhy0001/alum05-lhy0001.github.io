const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const svgPath = path.resolve(__dirname, '..', 'full-tree.svg')
const outPath = path.resolve(__dirname, '..', 'full-tree.png')

async function run() {
  if (!fs.existsSync(svgPath)) {
    console.error('SVG not found:', svgPath)
    process.exit(1)
  }
  try {
    await sharp(svgPath).png({ quality: 90 }).toFile(outPath)
    console.log('Wrote', outPath)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
