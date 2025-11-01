/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'

// https://vite.dev/config/
export default defineConfig({
  // Use a relative base so built asset URLs work whether the site is served
  // from the site root or a sub-path (works well for GitHub Pages).
  // For user/organization pages (username.github.io) you can also set base: '/'.
  base: './',
  plugins: [
    react(),
    // Dev-only plugin: expose an endpoint to spawn the backend server
    {
      name: 'dev-server-starter',
      configureServer(server) {
        let child = null

        server.middlewares.use((req, res, next) => {
          if (!req.url) return next()

          // Only allow in dev
          if (!server.config || !server.config.server || process.env.NODE_ENV === 'production') {
            res.statusCode = 404
            res.end('not found')
            return
          }

          // Simple JSON response helper
          const respond = obj => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(obj))
          }

          // Start endpoint
          if (req.url.startsWith('/__start-server')) {
            if (child && !child.killed) {
              return respond({ status: 'already-running' })
            }

            // Spawn node server/index.cjs in project root
            try {
              // Prefer running via npm script so package.json scripts and environment are respected
              const cmd = 'npm'
              const args = ['run', 'start:server']
              // Pass through important DB env vars so the spawned server can connect when required
              const childEnv = Object.assign({}, process.env, {
                DB_PASSWORD: process.env.DB_PASSWORD || process.env.NPM_CONFIG_DB_PASSWORD || '',
                DB_USER: process.env.DB_USER || process.env.NPM_CONFIG_DB_USER || '',
                DB_NAME: process.env.DB_NAME || process.env.NPM_CONFIG_DB_NAME || '',
                DB_HOST: process.env.DB_HOST || process.env.NPM_CONFIG_DB_HOST || '',
                DB_PORT: process.env.DB_PORT || process.env.NPM_CONFIG_DB_PORT || '',
              })
              child = spawn(cmd, args, {
                cwd: process.cwd(),
                env: childEnv,
                shell: true,
                detached: false,
              })

              // Pipe some logs into Vite logger
              child.stdout && child.stdout.on('data', d => server.config.logger.info('[ebook-server] ' + d.toString()))
              child.stderr && child.stderr.on('data', d => server.config.logger.error('[ebook-server] ' + d.toString()))

              child.on('exit', (code, sig) => {
                server.config.logger.info(`[ebook-server] exited ${code} ${sig}`)
                child = null
              })

              return respond({ status: 'started' })
            } catch (err) {
              server.config.logger.error('[ebook-server] failed to start', err)
              return respond({ status: 'error', message: String(err) })
            }
          }

          // Stop endpoint
          if (req.url.startsWith('/__stop-server')) {
            if (!child) return respond({ status: 'not-running' })
            try {
              // Attempt graceful kill
              child.kill()
              // if still not killed after a short delay, force kill
              setTimeout(() => {
                try { if (child && !child.killed) { 
                  try { child.kill() } catch { /* ignore */ }
                  // Windows may not honor signals; attempt taskkill fallback
                  if (process.platform === 'win32') {
                    const { exec } = require('child_process')
                    exec(`taskkill /PID ${child.pid} /T /F`, () => {})
                  }
                } } catch { /* ignore */ }
              }, 500)
              child = null
              server.config.logger.info('[ebook-server] stopped by dev endpoint')
              return respond({ status: 'stopped' })
            } catch (err) {
              server.config.logger.error('[ebook-server] failed to stop', err)
              return respond({ status: 'error', message: String(err) })
            }
          }

          return next()
        })
      },
    },
  ],
})
