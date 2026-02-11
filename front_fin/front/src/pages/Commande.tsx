import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function Commande() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/orders/${orderId}/`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setOrder(data);
            }
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadInvoice = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/orders/${orderId}/invoice/`, {
                credentials: 'include',
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `facture_${order.order_number}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    if (loading) return <div>Chargement...</div>;

    if (!order) return <div>Commande introuvable</div>;

    return (
        <div>
            <h1>Ouaip t'a bien payé</h1>
            <p>Votre commande a été créée avec succès.</p>

            <h2>Détails de la commande</h2>
            <p><strong>Numéro :</strong> {order.order_number}</p>
            <p><strong>Statut :</strong> {order.status}</p>
            <p><strong>Date :</strong> {new Date(order.created_at).toLocaleString()}</p>

            <h3>Articles commandés</h3>
            <table border={1}>
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Prix</th>
                        <th>Quantité</th>
                        <th>Sous-total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item: any) => (
                        <tr key={item.id}>
                            <td>{item.product_name}</td>
                            <td>{item.product_price}€</td>
                            <td>{item.quantity}</td>
                            <td>{item.subtotal}€</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: '20px' }}>
                <p><strong>Sous-total :</strong> {order.subtotal}€</p>
                {order.discount_amount > 0 && (
                    <p><strong>Réduction :</strong> -{order.discount_amount}€</p>
                )}
                <p><strong>Total :</strong> {order.total}€</p>
            </div>

            <div style={{ marginTop: '20px' }}>
                <button onClick={downloadInvoice} style={{ padding: '10px 20px' }}>
                    Télécharger la facture PDF
                </button>
            </div>
        </div>
    );
}

export default Commande;