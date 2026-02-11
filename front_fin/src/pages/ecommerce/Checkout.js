import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './Ecommerce.css';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart/');
      if (!response.data || response.data.items?.length === 0) {
        navigate('/cart');
        return;
      }
      setCart(response.data);
    } catch (err) {
      navigate('/cart');
    }
  };

  const validateDiscount = async () => {
    if (!discountCode) return;

    try {
      const response = await api.post('/discounts/validate/', {
        code: discountCode,
        total: cart.total,
      });
      
      if (response.data.valid) {
        setDiscount(response.data);
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Code promo invalide');
      setDiscount(null);
    }
  };

  const handleOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/orders/create/', {
        discount_code: discountCode || undefined,
        notes,
      });

      alert('Commande créée avec succès !');
      navigate(`/orders/${response.data.order.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création de la commande');
    } finally {
      setLoading(false);
    }
  };

  if (!cart) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const subtotal = parseFloat(cart.total);
  const discountAmount = discount ? parseFloat(discount.discount_amount) : 0;
  const total = discount ? parseFloat(discount.new_total) : subtotal;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Finaliser la commande</h1>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row">
          <div className="col-8">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Articles ({cart.item_count})</h3>
              </div>
              <div className="card-body">
                {cart.items.map((item) => (
                  <div key={item.id} className="checkout-item">
                    <div>
                      <h4>{item.product.name}</h4>
                      <p className="text-muted">Quantité: {item.quantity}</p>
                    </div>
                    <div className="price">{item.subtotal} ₡</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card mt-3">
              <div className="card-header">
                <h3 className="card-title">Code promo</h3>
              </div>
              <div className="card-body">
                <div className="discount-form">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Entrez votre code promo"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  />
                  <button
                    onClick={validateDiscount}
                    className="btn btn-secondary"
                  >
                    Appliquer
                  </button>
                </div>
                {discount && (
                  <div className="alert alert-success mt-2">
                    ✓ Code "{discount.discount.code}" appliqué : -{discount.discount_amount} ₡
                  </div>
                )}
              </div>
            </div>

            <div className="card mt-3">
              <div className="card-header">
                <h3 className="card-title">Notes (optionnel)</h3>
              </div>
              <div className="card-body">
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Instructions de livraison, remarques..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
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
                    <span>{subtotal.toFixed(2)} ₡</span>
                  </div>
                  
                  {discount && (
                    <div className="summary-row discount">
                      <span>Remise</span>
                      <span className="text-success">-{discountAmount.toFixed(2)} ₡</span>
                    </div>
                  )}

                  <div className="summary-row total">
                    <span>Total</span>
                    <span className="price">{total.toFixed(2)} ₡</span>
                  </div>
                </div>

                <button
                  onClick={handleOrder}
                  className="btn btn-primary btn-block btn-lg"
                  disabled={loading}
                >
                  {loading ? 'Commande en cours...' : 'Confirmer la commande'}
                </button>

                <button
                  onClick={() => navigate('/cart')}
                  className="btn btn-secondary btn-block mt-2"
                >
                  Retour au panier
                </button>
              </div>
            </div>

            <div className="card mt-3">
              <div className="card-body">
                <h4>🔒 Paiement sécurisé</h4>
                <p className="text-muted">
                  <small>
                    Vos transactions sont sécurisées par la Guilde.
                    Le cuivre sera débité après validation.
                  </small>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
