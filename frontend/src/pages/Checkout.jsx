import { useState, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CartContext } from '../contexts/CartContext'
import { AuthContext } from '../contexts/AuthContext'
import InvoicePDF from '../components/InvoicePDF'
import api from '../services/api'

export default function Checkout() {
  const { cart, getTotal, clearCart } = useContext(CartContext)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const invoiceRef = useRef()

  const [discountCode, setDiscountCode] = useState('')
  const [discount, setDiscount] = useState(null) // { percent, code }
  const [discountError, setDiscountError] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const applyDiscount = async () => {
    setDiscountError('')
    try {
      const res = await api.post('/orders/check-discount', { code: discountCode })
      setDiscount(res.data)
    } catch (err) {
      setDiscountError(err.response?.data?.detail || 'Code invalide.')
      setDiscount(null)
    }
  }

  const subtotal = getTotal()
  const discountAmount = discount ? subtotal * (discount.percent / 100) : 0
  const total = subtotal - discountAmount

  const handleOrder = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/orders', {
        items: cart.map((i) => ({ product_id: i.id, qty: i.quantity })),
        discount_code: discount?.code || null,
      })
      setOrder(res.data)
      clearCart()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la commande.')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (order) {
    return (
      <main>
        <h1>Commande confirmée</h1>
        <p>Commande n°<strong>{order.id}</strong> enregistrée.</p>
        <div ref={invoiceRef}>
          <InvoicePDF order={order} user={user} />
        </div>
        <button onClick={handlePrint} aria-label="Imprimer la facture">
          Imprimer la facture
        </button>
        <button onClick={() => navigate('/shop')} aria-label="Retourner à la boutique">
          Retour à la boutique
        </button>
      </main>
    )
  }

  return (
    <main>
      <h1>Validation de commande</h1>

      <section aria-label="Récapitulatif">
        <h2>Récapitulatif</h2>
        <ul role="list">
          {cart.map((item) => (
            <li key={item.id}>
              {item.name} × {item.quantity} — {(item.price * item.quantity).toFixed(2)} €
            </li>
          ))}
        </ul>
        <p>Sous-total : {subtotal.toFixed(2)} €</p>
        {discount && (
          <p>Remise ({discount.percent}%) : -{discountAmount.toFixed(2)} €</p>
        )}
        <p><strong>Total : {total.toFixed(2)} €</strong></p>
      </section>

      <section aria-label="Code de réduction">
        <h2>Code de réduction</h2>
        <input
          type="text"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          placeholder="Entrez votre code"
          aria-label="Code de réduction"
        />
        <button onClick={applyDiscount} aria-label="Appliquer le code de réduction">
          Appliquer
        </button>
        {discountError && <p role="alert" className="error">{discountError}</p>}
        {discount && <p className="success">Remise de {discount.percent}% appliquée !</p>}
      </section>

      <section aria-label="Paiement simulé">
        <h2>Paiement (simulation)</h2>
        <p>Aucune données bancaire réelle n'est collectée.</p>
        <input type="text" placeholder="Numéro de carte (fictif)" aria-label="Numéro de carte fictif" />
        <input type="text" placeholder="MM/AA" aria-label="Date d'expiration fictive" />
        <input type="text" placeholder="CVV" aria-label="CVV fictif" />
      </section>

      {error && <p role="alert" className="error">{error}</p>}

      <button onClick={handleOrder} disabled={loading || cart.length === 0} aria-busy={loading}>
        {loading ? 'Traitement...' : 'Confirmer la commande'}
      </button>
    </main>
  )
}