import React, { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'

import axios from 'axios'
import Pagination from './components/Pagination'

import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Courses from './components/Courses'
import Files from './components/Files'
import Calendar from './components/Calendar'
import Pokemon from './components/Pokemon'
import ToDoList from './components/ToDoList'

// Small local Landing and Loading components so this file is self-contained.
function Landing({ onEnter }) {
  return (
    <div style={{ textAlign: 'center', padding: 24 }}>
      <h1>Welcome</h1>
      <p>Browse the gallery or try paginated mode.</p>
      <button onClick={onEnter}>Enter app</button>
    </div>
  )
}

function Loading() {
  return <div style={{ padding: 16 }}>Loading…</div>
}

// ItemsGallery – merged pagination/gallery app from the other App.jsx
function ItemsGallery() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showLanding, setShowLanding] = useState(true)

  // Pagination state
  const [isPaginated, setIsPaginated] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    let cancelled = false
    const fetchItems = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch a short list from the public PokeAPI and derive images from ids.
        const res = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=60')
        const results = res.data.results.map((r) => {
          const m = r.url.match(/\/pokemon\/(\d+)\//)
          const id = m ? m[1] : r.name
          const image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
          return { id, name: r.name, image }
        })
        if (!cancelled) setItems(results)
      } catch (err) {
        if (!cancelled) setError(err.message || String(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchItems()
    return () => {
      cancelled = true
    }
  }, [])

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage))
  const start = (currentPage - 1) * itemsPerPage
  const visibleItems = !isPaginated ? items : items.slice(start, start + itemsPerPage)

  if (showLanding) {
    return <Landing onEnter={() => setShowLanding(false)} />
  }

  return (
    <div>
      <h2>Items</h2>

      <div>
        <label>
          <input
            type="checkbox"
            checked={isPaginated}
            onChange={(e) => {
              const pag = e.target.checked
              setIsPaginated(pag)
              if (pag) setCurrentPage(1)
            }}
          />{' '}
          Paginate results (show {itemsPerPage} per page)
        </label>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <p>Error: {error}</p>
      ) : visibleItems.length === 0 ? (
        <p>No items to display</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
          {visibleItems.map((item) => (
            <div key={item.id} style={{ textAlign: 'center', padding: 8, border: '1px solid #eee', borderRadius: 6 }}>
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = 'https://via.placeholder.com/96?text=?'
                }}
                style={{ width: 96, height: 96, objectFit: 'contain' }}
              />
              <div style={{ marginTop: 8, textTransform: 'capitalize' }}>{item.name}</div>
            </div>
          ))}
        </div>
      )}

      {isPaginated && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            const next = Math.max(1, Math.min(totalPages, page))
            setCurrentPage(next)
          }}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    // Use hash routing so server doesn't need SPA rewrite rules
    <HashRouter>
      <div className="app-root">
        <nav className="top-nav">
          <Link to="/dashboard">Dashboard</Link> |{' '}
          <Link to="/courses">Courses</Link> |{' '}
          <Link to="/files">Files</Link> |{' '}
          <Link to="/calendar">Calendar</Link> |{' '}
          <Link to="/pokemon">Component Compare</Link> |{' '}
          <Link to="/todo">ToDo App</Link> |{' '}
          <Link to="/login">Login</Link>
        </nav>

        <main style={{ padding: '16px' }}>
          <Routes>
            <Route path="/" element={<ToDoList />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/files" element={<Files />} />
            <Route path="/calendar" element={<Calendar />} />
            
            <Route path="/pokemon" element={<Pokemon />} />
            
           
            <Route path="/todo" element={<ToDoList />} />
            <Route path="/login" element={<Login />} />
           
          
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}
