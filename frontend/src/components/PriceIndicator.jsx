// price_modifier : valeur positive = hausse, négative = baisse, 0 ou null = stable
export default function PriceIndicator({ price, modifier }) {
  const trend = !modifier || modifier === 0
    ? 'stable'
    : modifier > 0 ? 'up' : 'down'

  const symbol = { up: '▲', down: '▼', stable: '' }
  const label  = { up: 'en hausse', down: 'en baisse', stable: 'stable' }
  const color  = { up: '#c0392b', down: '#27ae60', stable: 'inherit' }

  return (
    <span aria-label={`Prix : ${price.toFixed(2)} € — ${label[trend]}`}>
      <strong>{price.toFixed(2)} €</strong>
      {trend !== 'stable' && (
        <span
          aria-hidden="true"
          style={{ color: color[trend], marginLeft: '4px', fontSize: '0.85em' }}
        >
          {symbol[trend]}
        </span>
      )}
    </span>
  )
}