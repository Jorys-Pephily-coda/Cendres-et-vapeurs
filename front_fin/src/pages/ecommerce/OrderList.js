import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import './Ecommerce.css';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/');
      setOrders(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Mes Commandes</h1>
          <p className="page-subtitle">{orders.length} commande(s)</p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>Aucune commande</h3>
            <p>Vous n'avez pas encore passé de commande</p>
            <Link to="/products" className="btn btn-primary">
              Découvrir la boutique
            </Link>
          </div>
        ) : (
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>N° Commande</th>
                  <th>Date</th>
                  <th>Articles</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.order_number}</strong>
                    </td>
                    <td>
                      {new Date(order.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </td>
                    <td>{order.items?.length || 0}</td>
                    <td className="price">{order.total} ₡</td>
                    <td>
                      <span className={`badge badge-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/orders/${order.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
