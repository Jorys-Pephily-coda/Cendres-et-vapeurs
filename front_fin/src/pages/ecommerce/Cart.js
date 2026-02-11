import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './Ecommerce.css';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart/');
      setCart(response.data);
    } catch (err) {
      setError('Erreur lors du chargement du panier');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await api.put(`/cart/${itemId}/`, { quantity });
      fetchCart();
    } catch (err) {
      alert('Erreur lors de la mise à jour');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}/remove/`);
      fetchCart();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Vider tout le panier ?')) return;
    
    try {
      await api.delete('/cart/clear/');
      fetchCart();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <h2>Votre panier est vide</h2>
            <p>Découvrez nos produits et ajoutez-en à votre panier</p>
            <button onClick={() => navigate('/products')} className="btn btn-primary">
              Voir la boutique
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Mon Panier</h1>
          <p className="page-subtitle">{cart.item_count} article(s)</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row">
          <div className="col-8">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Articles</h3>
                <button onClick={clearCart} className="btn btn-danger btn-sm">
                  Vider le panier
                </button>
              </div>
              <div className="card-body">
                <div className="cart-items">
                  {cart.items.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-info">
                        <h4>{item.product.name}</h4>
                        <p className="text-muted">{item.product.category}</p>
                      </div>

                      <div className="cart-item-quantity">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-price">
                        <span className="price">{item.subtotal} ₡</span>
                        <small className="text-muted">
                          {item.product.current_price} ₡ × {item.quantity}
                        </small>
                      </div>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeItem(item.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-4">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Récapitulatif</h3>
              </div>
              <div className="card-body">
                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Sous-total</span>
                    <span className="price">{cart.total} ₡</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span className="price">{cart.total} ₡</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="btn btn-primary btn-block btn-lg"
                >
                  Passer commande
                </button>
                
                <button
                  onClick={() => navigate('/products')}
                  className="btn btn-secondary btn-block mt-2"
                >
                  Continuer mes achats
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
