import PriceIndicator from './PriceIndicator'

export default function ProductCard({ product, onAddToCart, onVote, canVote }) {
  const isOutOfStock = product.stock === 0

  return (
    <article aria-label={`Produit : ${product.name}`}>
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
        />
      )}

      <div>
        <h2>{product.name}</h2>

        {product.description && (
          <p>{product.description}</p>
        )}

        <div>
          <PriceIndicator price={product.price} modifier={product.price_modifier} />
          <span aria-label={`Stock : ${product.stock} unités`}>
            {isOutOfStock ? 'Rupture de stock' : `Stock : ${product.stock}`}
          </span>
        </div>

        <div>
          <button
            onClick={onVote}
            disabled={!canVote}
            aria-label={`Voter pour ${product.name} — ${product.likes} vote(s)`}
            aria-pressed={false}
            title={!canVote ? 'Connectez-vous pour voter' : ''}
          >
            ★ {product.likes}
          </button>

          <button
            onClick={onAddToCart}
            disabled={isOutOfStock}
            aria-label={`Ajouter ${product.name} au panier`}
            aria-disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Indisponible' : 'Ajouter au panier'}
          </button>
        </div>
      </div>
    </article>
  )
}