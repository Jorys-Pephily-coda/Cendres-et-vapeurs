import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './Ecommerce.css';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}/`);
      setOrder(response.data);
    } catch (err) {
      alert('Commande introuvable');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async () => {
    try {
      const response = await api.get(`/orders/${id}/invoice/`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture_${order.order_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Erreur lors du téléchargement de la facture');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="page">
      <div className="container">
        <button onClick={() => navigate('/orders')} className="btn btn-secondary mb-3">
          ← Retour aux commandes
        </button>

        <div className="page-header">
          <h1 className="page-title">Commande {order.order_number}</h1>
          <span className={`badge badge-${order.status}`}>{order.status}</span>
        </div>

        <div className="row">
          <div className="col-8">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Articles</h3>
              </div>
              <div className="card-body">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Prix unitaire</th>
                      <th>Quantité</th>
                      <th>Sous-total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.product_name}</td>
                        <td>{item.price} ₡</td>
                        <td>{item.quantity}</td>
                        <td className="price">{item.subtotal} ₡</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {order.notes && (
              <div className="card mt-3">
                <div className="card-header">
                  <h3 className="card-title">Notes</h3>
                </div>
                <div className="card-body">
                  <p>{order.notes}</p>
                </div>
              </div>
            )}
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
                    <span>{order.subtotal} ₡</span>
                  </div>
                  
                  {order.discount_amount > 0 && (
                    <div className="summary-row discount">
                      <span>Remise</span>
                      <span className="text-success">-{order.discount_amount} ₡</span>
                    </div>
                  )}

                  <div className="summary-row total">
                    <span>Total</span>
                    <span className="price">{order.total} ₡</span>
                  </div>
                </div>

                <button
                  onClick={downloadInvoice}
                  className="btn btn-primary btn-block"
                >
                  📄 Télécharger la facture
                </button>
              </div>
            </div>

            <div className="card mt-3">
              <div className="card-header">
                <h3 className="card-title">Informations</h3>
              </div>
              <div className="card-body">
                <p>
                  <strong>Date :</strong>{' '}
                  {new Date(order.created_at).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </p>
                <p>
                  <strong>Statut :</strong>{' '}
                  <span className={`badge badge-${order.status}`}>
                    {order.status}
                  </span>
                </p>
                {order.discount_code && (
                  <p>
                    <strong>Code promo :</strong> {order.discount_code}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
