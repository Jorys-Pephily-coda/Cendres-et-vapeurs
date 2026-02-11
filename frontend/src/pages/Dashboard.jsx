import { useState, useEffect } from 'react'
import api from '../services/api'

const TABS = ['Utilisateurs', 'Produits', 'Commandes']

export default function Dashboard() {
  const [activeTab, setActiveTab]         = useState('Utilisateurs')
  const [users, setUsers]                 = useState([])
  const [products, setProducts]           = useState([])
  const [orders, setOrders]               = useState([])
  const [loading, setLoading]             = useState(false)
  const [editProduct, setEditProduct]     = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'Utilisateurs') {
        const res = await api.get('users/')
        setUsers(res.data)
      } else if (activeTab === 'Produits') {
        const res = await api.get('products/')
        setProducts(res.data)
      } else if (activeTab === 'Commandes') {
        const res = await api.get('orders/')
        setOrders(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    await api.delete(`users/${id}`)
    fetchData()
  }

  const handleChangeRole = async (id, role) => {
    await api.patch(`users/${id}`, { role })
    fetchData()
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return
    await api.delete(`products/${id}`)
    fetchData()
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const data = {
      name:        form.get('name'),
      description: form.get('description'),
      price:       parseFloat(form.get('price')),
      stock:       parseInt(form.get('stock')),
      image_url:   form.get('image_url'),
    }

    try {
      if (editProduct) {
        await api.patch(`products/${editProduct.id}`, data)
      } else {
        await api.post('products/', data)
      }
      setShowProductForm(false)
      setEditProduct(null)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur')
    }
  }

  const handleUpdateOrderStatus = async (id, status) => {
    await api.patch(`orders/${id}`, { status })
    fetchData()
  }

  return (
    <main>
      <h1>Tableau de bord</h1>

      <nav role="tablist" aria-label="Sections du tableau de bord">
        {TABS.map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? 'active' : ''}
          >
            {tab}
          </button>
        ))}
      </nav>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <section role="tabpanel" aria-labelledby={activeTab}>
          {activeTab === 'Utilisateurs' && (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Vérifié</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      >
                        <option value="guest">guest</option>
                        <option value="user">user</option>
                        <option value="editor">editor</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>{u.is_verified ? '✓' : '✗'}</td>
                    <td>
                      <button className="danger" onClick={() => handleDeleteUser(u.id)}>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'Produits' && (
            <>
              <button onClick={() => { setShowProductForm(true); setEditProduct(null); }}>
                ➕ Ajouter un produit
              </button>

              {showProductForm && (
                <form onSubmit={handleSaveProduct} style={{ margin: '20px 0', padding: '20px', border: '1px solid #b87333' }}>
                  <h3>{editProduct ? 'Modifier' : 'Nouveau produit'}</h3>
                  <label>Nom</label>
                  <input name="name" defaultValue={editProduct?.name} required />
                  
                  <label>Description</label>
                  <textarea name="description" defaultValue={editProduct?.description} rows={3} />
                  
                  <label>Prix</label>
                  <input name="price" type="number" step="0.01" defaultValue={editProduct?.price} required />
                  
                  <label>Stock</label>
                  <input name="stock" type="number" defaultValue={editProduct?.stock} required />
                  
                  <label>Image URL</label>
                  <input name="image_url" defaultValue={editProduct?.image_url} />
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="submit">Enregistrer</button>
                    <button type="button" onClick={() => { setShowProductForm(false); setEditProduct(null); }}>
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Prix</th>
                    <th>Stock</th>
                    <th>Likes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.name}</td>
                      <td>{p.price.toFixed(2)} €</td>
                      <td>{p.stock}</td>
                      <td>{p.likes}</td>
                      <td>
                        <button onClick={() => { setEditProduct(p); setShowProductForm(true); }}>
                          Modifier
                        </button>
                        <button className="danger" onClick={() => handleDeleteProduct(p.id)}>
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {activeTab === 'Commandes' && (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Utilisateur</th>
                  <th>Total</th>
                  <th>Réduction</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.user_email || 'N/A'}</td>
                    <td>{o.total.toFixed(2)} €</td>
                    <td>{o.discount_amount > 0 ? `-${o.discount_amount.toFixed(2)} €` : '-'}</td>
                    <td>
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="shipped">shipped</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => alert(JSON.stringify(o.items, null, 2))}>
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </main>
  )
}