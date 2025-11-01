
import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Files() {
  const [ebooks, setEbooks] = useState([])
  const [starting, setStarting] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [showNamesOnly, setShowNamesOnly] = useState(false)
  // compute API base depending on dev/prod so links work when served from the same host
  // NOTE: temporary fallback: when running in production and DSM reverse-proxy is not forwarding
  // /api to the internal Node server, use the NAS host:port directly. Remove or revert to ''
  // once reverse-proxy is fixed.
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development')
    ? 'http://localhost:4000'
    : 'http://192.168.1.132:4000'

  useEffect(() => {
    let mounted = true

    async function tryFetch(retries = 6) {
      try {
        // use computed API_BASE so dev/prod work the same
        const url = `${API_BASE}/api/ebooks`
        const res = await axios.get(url, { timeout: 3000 })
        if (!mounted) return
        // Accept either an array response or an object with an `ebooks` field
        const data = res && res.data
        if (Array.isArray(data)) {
          setEbooks(data)
        } else if (data && Array.isArray(data.ebooks)) {
          setEbooks(data.ebooks)
        } else {
          // Unexpected shape — attempt to coerce or warn
          console.warn('Unexpected /api/ebooks response shape, setting ebooks to empty', data)
          setEbooks([])
        }
        setStarting(false)
      } catch (err) {
        if (retries <= 0) {
          setStarting(false)
          console.error('Failed to fetch ebooks after retries', err)
          return
        }
        // wait a bit then retry
        await new Promise(r => setTimeout(r, 1000))
        return tryFetch(retries - 1)
      }
    }

    async function ensureServerAndFetch() {
      // In production do not attempt to start server
      const mode = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE) || 'development'
      if (mode === 'production') {
        return tryFetch(1)
      }

      setStarting(true)
      try {
        // Attempt to start the server via Vite dev endpoint
        await axios.post('/__start-server', null, { timeout: 2000 })
      } catch (err) {
        console.debug('start-server request failed (okay if not using vite dev):', err && err.message)
      }

      // try fetching with multiple retries
      tryFetch(8)
    }

    ensureServerAndFetch()

    return () => { mounted = false }
  }, [API_BASE])

  async function stopServer() {
    try {
      await axios.post('/__stop-server')
      setStarting(false)
      // clear list until restarted
      setEbooks([])
      alert('Server stop requested')
    } catch (err) {
      console.error('stop-server failed', err)
      alert('Failed to stop server: ' + (err && err.message))
    }
  }


  // Preview and download are handled directly by anchor links in the UI

  return (
    <div>
      <h2>Files</h2>
      <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => setShowDebug(s => !s)} style={{ fontSize: 12 }}>
          {showDebug ? 'Hide' : 'Show'} raw ebooks JSON
        </button>
        <button onClick={() => setShowNamesOnly(s => !s)} style={{ fontSize: 12 }}>
          {showNamesOnly ? 'Hide' : 'Show'} names only
        </button>
        <button
          onClick={() => {
            try {
              const blob = new Blob([JSON.stringify(ebooks || [], null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'ebooks.json'
              document.body.appendChild(a)
              a.click()
              a.remove()
              URL.revokeObjectURL(url)
            } catch (e) {
              console.error('Failed to download JSON', e)
              alert('Failed to download JSON: ' + (e && e.message))
            }
          }}
          style={{ fontSize: 12 }}
        >
          Download JSON
        </button>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } } .fc-status { display:flex; align-items:center; gap:8px; margin-bottom:8px } .fc-started { color:#059669; font-weight:600 }`}</style>
      {starting && (
        <div className="fc-status">
          <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #e5e7eb', borderTop: '2px solid #0366d6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} aria-hidden="true" />
          <div>Starting server...</div>
          <button style={{ marginLeft: 8 }} onClick={stopServer}>Stop server</button>
        </div>
      )}
      {ebooks.length === 0 ? (
        (!starting ? <p className="muted">No files available. Start the server that exposes the ebooks DB.</p> : null)
      ) : (
        <>
            {showNamesOnly && (
              <div style={{ marginBottom: 8 }}>
                <strong>Names:</strong>
                <ul style={{ marginTop: 6 }}>
                  {ebooks.map(e => (
                    <li key={`name-${e.id || e.filename || Math.random()}`}>{e.title || e.filename || `ebook-${e.id}`}</li>
                  ))}
                </ul>
              </div>
            )}
          {!starting && (
            <div className="fc-status"><div className="fc-started">Server started</div><button style={{ marginLeft: 8 }} onClick={stopServer}>Stop server</button></div>
          )}
        <ul className="list">
          {ebooks.map(e => {
            const title = e.title || e.filename || `ebook-${e.id}`
            const previewUrl = `${API_BASE}/api/ebooks/${e.id}/download?preview=1`
            const downloadUrl = `${API_BASE}/api/ebooks/${e.id}/download`
            return (
              <li key={e.id} style={{ marginBottom: 8 }}>
                {/* Name only display: title is a link for preview; small download link beside it */}
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: '#0366d6', textDecoration: 'none' }}>{title}</a>
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, fontSize: 12 }} title="Download PDF">[download]</a>
              </li>
            )
          })}
        </ul>
        {showDebug && (
          <div style={{ marginTop: 12 }}>
            <h3 style={{ fontSize: 14 }}>Debug: raw ebooks JSON</h3>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#f6f8fa', padding: 8, borderRadius: 6, maxHeight: 300, overflow: 'auto' }}>
              {JSON.stringify(ebooks, null, 2)}
            </pre>
          </div>
        )}
        </>
      )}
    </div>
  )
}
