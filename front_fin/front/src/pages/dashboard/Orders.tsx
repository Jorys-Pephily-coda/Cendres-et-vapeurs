import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Orders() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        if (user?.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchOrders();
    }, [user, navigate]);

    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/orders/', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data.results || data);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        try {
            const response = await fetch(`http://localhost:8000/api/orders/${orderId}/update_status/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus }),
            });
            if (response.ok) {
                fetchOrders();
            } else {
                const data = await response.json().catch(() => ({}));
                alert(data.error || 'Erreur lors de la mise à jour du statut');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    return (
        <div className="page">
            <h1>Gestion des Commandes</h1>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>N° Commande</th>
                        <th>Total</th>
                        <th>Statut</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td>{order.order_number}</td>
                            <td>{order.total}€</td>
                            <td>
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                >
                                    <option value="pending">En attente</option>
                                    <option value="paid">Payé</option>
                                    <option value="shipped">Expédié</option>
                                    <option value="delivered">Livré</option>
                                    <option value="cancelled">Annulé</option>
                                </select>
                            </td>
                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Orders;
