import { useState, useEffect, useContext } from 'react'
import { CartContext } from '../contexts/CartContext'
import { AuthContext } from '../contexts/AuthContext'
import ProductCard from '../components/ProductCard'
import api from '../services/api'

export default function Shop() {
  const { addToCart }   = useContext(CartContext)
  const { user, token } = useContext(AuthContext)

  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [sortBy, setSortBy]     = useState('likes')
  const [search, setSearch]     = useState('')

  const fetchProducts = async () => {
    try {
      const res = await api.get('products/')
      setProducts(res.data)
    } catch {
      setError('Impossible de charger les produits.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleVote = async (productId) => {
    if (!user) return

    // Forcer le header avec le token courant
    const currentToken = token || sessionStorage.getItem('token')
    if (!currentToken) {
      console.warn('[Shop] Pas de token disponible pour voter')
      return
    }

    try {
      const res = await api.post(`votes/${productId}`, {}, {
        headers: { Authorization: `Bearer ${currentToken}` }
      })
      console.log('[Shop] Vote OK:', res.data)
      fetchProducts()
    } catch (err) {
      console.error('[Shop] Erreur vote:', err.response?.data || err.message)
    }
  }

  const sorted = [...products]
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'likes')      return b.likes - a.likes
      if (sortBy === 'price_asc')  return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      return 0
    })

  if (loading) return <p>Chargement des produits...</p>
  if (error)   return <p className="error">{error}</p>

  return (
    <main>
      <h1>Vitrine</h1>

      <div className="shop-controls">
        <input
          type="search"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Rechercher un produit"
        />
        <label htmlFor="sort">Trier par</label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="likes">Popularité</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <p>Aucun produit trouvé.</p>
      ) : (
        <ul className="product-grid" role="list">
          {sorted.map(product => (
            <li key={product.id}>
              <ProductCard
                product={product}
                onAddToCart={() => addToCart(product)}
                onVote={() => handleVote(product.id)}
                canVote={!!user}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}