import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import './Products.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
    fetchPriceHistory();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}/`);
      setProduct(response.data);
      setError('');
    } catch (err) {
      setError('Produit introuvable');
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      const response = await api.get(`/products/${id}/price_history/`);
      setPriceHistory(response.data.slice(0, 10)); // Last 10 changes
    } catch (err) {
      console.error('Error fetching price history:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Vous devez être connecté pour ajouter au panier');
      navigate('/login');
      return;
    }

    try {
      await api.post('/cart/add/', {
        product_id: product.id,
        quantity: quantity,
      });
      alert('Produit ajouté au panier');
      navigate('/cart');
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de l\'ajout au panier');
    }
  };

  const handleVote = async () => {
    if (!user) {
      alert('Vous devez être connecté pour voter');
      return;
    }

    try {
      await api.post(`/products/${id}/vote/`);
      fetchProduct(); // Refresh to get updated vote count
    } catch (err) {
      alert('Erreur lors du vote');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container">
        <div className="alert alert-danger">{error}</div>
        <button onClick={() => navigate('/products')} className="btn btn-secondary">
          Retour à la boutique
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <button onClick={() => navigate('/products')} className="btn btn-secondary mb-3">
          ← Retour
        </button>

        <div className="product-detail">
          <div className="row">
            <div className="col-6">
              <div className="card">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-detail-image"
                  />
                ) : (
                  <div className="product-detail-image-placeholder">
                  </div>
                )}
              </div>

              {priceHistory.length > 0 && (
                <div className="card mt-3">
                  <div className="card-header">
                    <h3 className="card-title">Historique des prix</h3>
                  </div>
                  <div className="card-body">
                    <div className="price-history">
                      {priceHistory.map((entry, index) => (
                        <div key={entry.id} className="price-history-item">
                          <span className="price-history-value">
                            {entry.price} ₡
                          </span>
                          <span className="price-history-date">
                            {new Date(entry.timestamp).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="col-6">
              <div className="card">
                <div className="card-body">
                  <h1 className="product-detail-title">{product.name}</h1>
                  
                  <p className="product-category">
                    <span className="badge badge-user">{product.category}</span>
                  </p>

                  <div className="product-detail-price">
                    <span className="price">{product.current_price} ₡</span>
                    {product.current_price !== product.base_price && (
                      <>
                        <span className="price-old">{product.base_price} ₡</span>
                        <span className={`price-change ${product.current_price > product.base_price ? 'up' : 'down'}`}>
                          {product.current_price > product.base_price ? '↑' : '↓'}
                          {Math.abs(((product.current_price - product.base_price) / product.base_price) * 100).toFixed(1)}%
                        </span>
                      </>
                    )}
                  </div>

                  <div className="product-votes">
                    <button onClick={handleVote} className="btn-vote-large">
                      ❤️ {product.vote_count || 0} votes
                    </button>
                  </div>

                  <div className="product-stock">
                    {product.stock > 0 ? (
                      <span className="stock-available">
                        ✓ {product.stock} en stock
                      </span>
                    ) : (
                      <span className="stock-out">
                        ✗ Rupture de stock
                      </span>
                    )}
                  </div>

                  <div className="product-description">
                    <h3>Description</h3>
                    <p>{product.description}</p>
                  </div>

                  {product.stock > 0 && (
                    <div className="product-buy">
                      <div className="quantity-selector">
                        <label className="form-label">Quantité</label>
                        <div className="quantity-controls">
                          <button
                            className="btn btn-secondary"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="form-control"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                            max={product.stock}
                          />
                          <button
                            className="btn btn-secondary"
                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleAddToCart}
                        className="btn btn-primary btn-block btn-lg"
                      >
                        Ajouter au panier - {(product.current_price * quantity).toFixed(2)} ₡
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="card mt-3">
                <div className="card-header">
                  <h3 className="card-title">Informations</h3>
                </div>
                <div className="card-body">
                  <p><strong>Ajouté par :</strong> {product.created_by || 'La Guilde'}</p>
                  <p><strong>Date d'ajout :</strong> {new Date(product.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                  <p><strong>Dernière MAJ :</strong> {new Date(product.updated_at).toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
