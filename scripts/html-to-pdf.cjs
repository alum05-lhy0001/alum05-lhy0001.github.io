const path = require('path')
const fs = require('fs')
const puppeteer = require('puppeteer')

async function run() {
  // Allow optional args: source HTML and output PDF
  const srcArg = process.argv[2] || path.resolve(__dirname, '..', 'canvas-summary.html')
  const outArg = process.argv[3] || path.resolve(__dirname, '..', 'canvas-summary.pdf')

  const htmlPath = path.isAbsolute(srcArg) ? srcArg : path.resolve(process.cwd(), srcArg)
  const outPath = path.isAbsolute(outArg) ? outArg : path.resolve(process.cwd(), outArg)

  if (!fs.existsSync(htmlPath)) {
    console.error('HTML not found:', htmlPath)
    process.exit(1)
  }

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()
  await page.goto('file://' + htmlPath)
  await page.pdf({ path: outPath, format: 'A4', printBackground: true })
  await browser.close()
  console.log('Wrote', outPath)
}

run().catch(err => { console.error(err); process.exit(1) })
