import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import './Products.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    sortByVotes: false,
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.sortByVotes) params.sort_by_votes = 'true';

      const response = await api.get('/products/', { params });
      setProducts(response.data.results || response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (productId) => {
    try {
      const response = await api.post(`/products/${productId}/vote/`);
      // Refresh products to get updated vote counts
      fetchProducts();
    } catch (err) {
      alert('Vous devez être connecté pour voter');
    }
  };

  const categories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'minerals', label: 'Minéraux' },
    { value: 'equipments', label: 'Équipements' },
    { value: 'consumables', label: 'Consommables' },
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Boutique de la Zone</h1>
          <p className="page-subtitle">Troquez vos ressources contre des équipements</p>
        </div>

        <div className="products-filters card">
          <div className="filters-row">
            <div className="filter-group">
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher un produit..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <select
                className="form-control"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <input
                  type="checkbox"
                  checked={filters.sortByVotes}
                  onChange={(e) => setFilters({ ...filters, sortByVotes: e.target.checked })}
                />
                {' '}Trier par votes
              </label>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>Aucun produit trouvé</h3>
            <p>Modifiez vos filtres pour voir plus de résultats</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card card">
                {product.image && (
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                )}
                
                <div className="product-body">
                  <h3 className="product-title">
                    <Link to={`/products/${product.id}`}>{product.name}</Link>
                  </h3>
                  
                  <p className="product-category">
                    <span className="badge badge-user">{product.category}</span>
                  </p>

                  <p className="product-description">
                    {product.description?.substring(0, 100)}
                    {product.description?.length > 100 && '...'}
                  </p>

                  <div className="product-footer">
                    <div className="product-price">
                      <span className="price">{product.current_price} ₡</span>
                      {product.current_price !== product.base_price && (
                        <span className="price-old">{product.base_price} ₡</span>
                      )}
                    </div>

                    <div className="product-actions">
                      <button
                        className="btn-vote"
                        onClick={() => handleVote(product.id)}
                        title="Voter pour ce produit"
                      >
                        ❤️ {product.vote_count || 0}
                      </button>
                      
                      <Link
                        to={`/products/${product.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Voir
                      </Link>
                    </div>
                  </div>

                  {product.stock < 5 && product.stock > 0 && (
                    <div className="stock-warning">
                      ⚠️ Plus que {product.stock} en stock
                    </div>
                  )}
                  
                  {product.stock === 0 && (
                    <div className="stock-out">
                      ✗ Rupture de stock
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
