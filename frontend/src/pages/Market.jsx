import { useState, useEffect } from 'react'
import api from '../services/api'

const POLL_INTERVAL = 8000

export default function Market() {
  const [products, setProducts] = useState([])
  const [prevPrices, setPrevPrices] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMarket()
    const interval = setInterval(fetchMarket, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  const fetchMarket = async () => {
    try {
      const res = await api.get('/market/prices')
      setProducts(prev => {
        // Sauvegarder les prix précédents avant la mise à jour
        const oldPrices = {}
        prev.forEach(p => { oldPrices[p.id] = p.price })
        setPrevPrices(oldPrices)
        return res.data
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getPriceTrend = (product) => {
    const prev = prevPrices[product.id]
    if (prev === undefined || prev === product.price) return 'stable'
    return product.price > prev ? 'up' : 'down'
  }

  const getTrendSymbol = (trend) => {
    if (trend === 'up') return '▲'
    if (trend === 'down') return '▼'
    return '—'
  }

  const getTrendColor = (trend) => {
    if (trend === 'up') return '#c0392b'
    if (trend === 'down') return '#27ae60'
    return 'inherit'
  }

  if (loading) return <p aria-live="polite">Chargement du marché...</p>

  return (
    <main>
      <h1>Bourse du Cuivre</h1>
      <p>Les prix fluctuent à chaque consultation et achat selon l'offre et la demande.</p>
      <p>Mise à jour toutes les {POLL_INTERVAL / 1000} secondes.</p>

      <table aria-label="Cours des produits">
        <thead>
          <tr>
            <th scope="col">Produit</th>
            <th scope="col">Prix actuel</th>
            <th scope="col">Tendance</th>
            <th scope="col">Vues</th>
            <th scope="col">Achats</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const trend = getPriceTrend(p)
            return (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>
                  <strong>{p.price.toFixed(2)} €</strong>
                </td>
                <td
                  style={{ color: getTrendColor(trend), fontWeight: 'bold' }}
                  aria-label={`Tendance : ${trend === 'up' ? 'hausse' : trend === 'down' ? 'baisse' : 'stable'}`}
                >
                  {getTrendSymbol(trend)}
                </td>
                <td>{p.views}</td>
                <td>{p.sales ?? 0}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <section aria-label="Légende des indicateurs">
        <h2>Légende</h2>
        <ul>
          <li style={{ color: '#c0392b' }}>▲ Hausse du prix</li>
          <li style={{ color: '#27ae60' }}>▼ Baisse du prix</li>
          <li>— Stable</li>
        </ul>
      </section>
    </main>
  )
}