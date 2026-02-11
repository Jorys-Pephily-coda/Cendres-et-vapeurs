export default function InvoicePDF({ order, user }) {
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    })

  return (
    <section aria-label="Facture de commande" className="invoice">
      <header>
        <h2>FACTURE</h2>
        <p>Cendres &amp; Vapeur — Zone Franche</p>
      </header>

      <div>
        <div>
          <h3>Émetteur</h3>
          <p>Guilde Marchande de la Colonie</p>
          <p>Zone Franche, Secteur 4</p>
          <p>contact@cendres-et-vapeur.colony</p>
        </div>

        <div>
          <h3>Client</h3>
          <p>{user?.email}</p>
        </div>
      </div>

      <div>
        <p><strong>Numéro de commande :</strong> #{order.id}</p>
        <p><strong>Date :</strong> {formatDate(order.created_at)}</p>
        <p><strong>Statut :</strong> {order.status}</p>
      </div>

      <table aria-label="Détail des articles">
        <thead>
          <tr>
            <th scope="col">Désignation</th>
            <th scope="col">Qté</th>
            <th scope="col">Prix unitaire</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item, i) => (
            <tr key={i}>
              <td>{item.product_name}</td>
              <td>{item.qty}</td>
              <td>{item.unit_price.toFixed(2)} €</td>
              <td>{(item.qty * item.unit_price).toFixed(2)} €</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          {order.discount_amount > 0 && (
            <tr>
              <td colSpan={3}>Remise appliquée</td>
              <td>-{order.discount_amount.toFixed(2)} €</td>
            </tr>
          )}
          <tr>
            <td colSpan={3}><strong>Total TTC</strong></td>
            <td><strong>{order.total.toFixed(2)} €</strong></td>
          </tr>
        </tfoot>
      </table>

      <footer>
        <p>Merci pour votre contribution à la survie de la colonie.</p>
        <p>Ce document tient lieu de reçu officiel.</p>
      </footer>
    </section>
  )
}