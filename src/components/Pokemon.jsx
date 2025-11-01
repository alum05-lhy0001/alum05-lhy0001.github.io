import { useState, useEffect } from 'react'
import axios from 'axios'
import Pagination from './Pagination'

// Small local Loading and Landing so this component is self-contained.
function Loading() {
  return <div style={{ padding: 16 }}>Loading…</div>
}

function Landing({ onEnter }) {
  return (
    <div style={{ textAlign: 'center', padding: 24 }}>
      <h3>Welcome to the Pokémon gallery</h3>
      <button onClick={onEnter}>Enter</button>
    </div>
  )
}

function Pokemon() {
  const [showLanding, setShowLanding] = useState(true)

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    async function fetchPokemon() {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=20')
        const fetched = res.data.results.map((r, idx) => {
      
          const m = r.url && r.url.match(/\/pokemon\/(\d+)\/?$/)
          const id = m ? Number(m[1]) : idx + 1
          const image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
          return { id, name: r.name, image }
        })
        if (mounted) setItems(fetched)
      } catch (err) {
        if (mounted) setError(err.message || 'Fetch error')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchPokemon()

    return () => { mounted = false }
  }, [])

  // Pagination state
  const [isPaginated, setIsPaginated] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage))

  // Compute visible items depending on pagination toggle (simple, without useMemo)
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
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/96?text=?' }}
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

export default Pokemon
