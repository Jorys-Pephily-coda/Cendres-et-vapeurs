import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './Admin.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'minerals',
    base_price: '',
    stock: '',
    is_active: true,
  });
  const [imageFile, setImageFile] = useState(null);

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        setImageFile(blob);
        e.preventDefault();
        break;
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/');
      setProducts(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('base_price', formData.base_price);
      data.append('stock', formData.stock);
      data.append('is_active', formData.is_active);
      
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Produit modifié');
      } else {
        await api.post('/products/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Produit créé');
      }
      
      fetchProducts();
      resetForm();
    } catch (err) {
      console.error('Error:', err);
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      base_price: product.base_price,
      stock: product.stock,
      is_active: product.is_active,
    });
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;

    try {
      await api.delete(`/products/${id}/`);
      fetchProducts();
      alert('Produit supprimé');
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: 'minerals',
      base_price: '',
      stock: '',
      is_active: true,
    });
    setImageFile(null);
  };

  const categories = [
    { value: 'minerals', label: 'Minéraux' },
    { value: 'equipments', label: 'Équipements' },
    { value: 'consumables', label: 'Consommables' },
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📦 Gestion des Produits</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            + Nouveau produit
          </button>
        </div>

        {showForm && (
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Nom</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Catégorie</label>
                      <select
                        className="form-control"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                  />
                </div>

                <div className="row">
                  <div className="col-4">
                    <div className="form-group">
                      <label className="form-label">Prix de base</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.base_price}
                        onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-group">
                      <label className="form-label">Stock</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-group">
                      <label className="form-label">Image (optionnel)</label>
                      <div 
                        onPaste={handlePaste}
                        style={{ position: 'relative' }}
                      >
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={(e) => setImageFile(e.target.files[0])}
                        />
                        <small className="text-muted d-block mt-1">
                          📎 Choisir un fichier ou Ctrl+V pour coller
                        </small>
                      </div>
                      {imageFile && (
                        <small className="text-success d-block mt-1">
                          ✓ Image sélectionnée: {imageFile.name || 'image collée'}
                        </small>
                      )}
                      {editingProduct?.image && !imageFile && (
                        <small className="text-muted">Image actuelle présente</small>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    {' '}Produit actif
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? 'Modifier' : 'Créer'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Votes</th>
                <th>Actif</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td><strong>{product.name}</strong></td>
                  <td>
                    <span className="badge badge-user">{product.category}</span>
                  </td>
                  <td>{product.current_price} ₡</td>
                  <td>{product.stock}</td>
                  <td>❤️ {product.vote_count || 0}</td>
                  <td>
                    {product.is_active ? (
                      <span className="text-success">✓</span>
                    ) : (
                      <span className="text-muted">✗</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(product)}
                      className="btn btn-secondary btn-sm mr-2"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
