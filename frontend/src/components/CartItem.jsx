export default function CartItem({ item, onRemove, onQuantityChange }) {
  return (
    <article aria-label={`Article : ${item.name}`}>
      <div>
        <h3>{item.name}</h3>
        <p aria-label={`Prix unitaire : ${item.price.toFixed(2)} €`}>
          {item.price.toFixed(2)} € / unité
        </p>
      </div>

      <div>
        <label htmlFor={`qty-${item.id}`}>Quantité</label>
        <input
          id={`qty-${item.id}`}
          type="number"
          min={1}
          max={item.stock}
          value={item.quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
          aria-label={`Quantité de ${item.name}`}
        />
      </div>

      <p aria-label={`Sous-total : ${(item.price * item.quantity).toFixed(2)} €`}>
        <strong>{(item.price * item.quantity).toFixed(2)} €</strong>
      </p>

      <button
        onClick={onRemove}
        aria-label={`Retirer ${item.name} du panier`}
      >
        Retirer
      </button>
    </article>
  )
}