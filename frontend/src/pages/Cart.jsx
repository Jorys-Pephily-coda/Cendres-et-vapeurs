import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { CartContext } from '../contexts/CartContext'
import CartItem from '../components/CartItem'

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotal } = useContext(CartContext)
  const navigate = useNavigate()

  if (cart.length === 0) {
    return (
      <main>
        <h1>Panier</h1>
        <p>Votre panier est vide.</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Panier</h1>

      <ul role="list" aria-label="Contenu du panier">
        {cart.map((item) => (
          <li key={item.id}>
            <CartItem
              item={item}
              onRemove={() => removeFromCart(item.id)}
              onQuantityChange={(qty) => updateQuantity(item.id, qty)}
            />
          </li>
        ))}
      </ul>

      <section aria-label="Résumé de la commande">
        <p>
          <strong>Total : {getTotal().toFixed(2)} €</strong>
        </p>

        <button onClick={clearCart} aria-label="Vider le panier">
          Vider le panier
        </button>

        <button
          onClick={() => navigate('/checkout')}
          aria-label="Passer la commande"
        >
          Commander
        </button>
      </section>
    </main>
  )
}