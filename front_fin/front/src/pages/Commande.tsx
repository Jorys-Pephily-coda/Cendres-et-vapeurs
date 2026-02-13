import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createStripeCheckoutSession } from '../service/Stripe';

function Commande() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);

    const parsedOrderId = useMemo(() => {
        if (!orderId) return null;
        const n = Number(orderId);
        return Number.isFinite(n) ? n : null;
    }, [orderId]);

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

    const handleStripePay = async () => {
        if (!parsedOrderId) {
            alert('orderId manquant ou invalide');
            return;
        }
        try {
            setPaying(true);
            const origin = window.location.origin;
            const successUrl = `${origin}/commande?orderId=${parsedOrderId}`;
            const cancelUrl = `${origin}/commande?orderId=${parsedOrderId}`;

            const session = await createStripeCheckoutSession({
                orderId: parsedOrderId,
                successUrl,
                cancelUrl,
            });
            window.location.href = session.url;
        } catch (e) {
            console.error('Erreur Stripe:', e);
            alert(e instanceof Error ? e.message : 'Erreur lors du paiement Stripe');
        } finally {
            setPaying(false);
        }
    };

    if (loading) return <div>Chargement...</div>;

    if (!order) return <div>Commande introuvable</div>;

    const isPending = order.status === 'pending';
    const isConfirmed = order.status === 'confirmed';

    return (
        <div className="page">
            <h1>{isConfirmed ? 'Paiement confirmé' : 'Commande'}</h1>
            <p>
                {isConfirmed
                    ? 'Votre paiement a été confirmé.'
                    : "Votre commande a été créée. Vous pouvez procéder au paiement."}
            </p>

            <h2>Détails de la commande</h2>
            <p><strong>Numéro :</strong> {order.order_number}</p>
            <p><strong>Statut :</strong> {order.status}</p>
            <p><strong>Date :</strong> {new Date(order.created_at).toLocaleString()}</p>
            <h3>Articles commandés</h3>
            <table className="data-table">
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
            {isPending && (
                <div className="mt-lg">
                    <button className="btn-copper" onClick={handleStripePay} disabled={paying}>
                        {paying ? 'Redirection vers Stripe...' : 'Payer avec Stripe'}
                    </button>
                </div>
            )}
            
            {isConfirmed && <p className="text-success">Merci pour votre achat !</p>}
            {isConfirmed && (<button className="btn-secondary mt-lg" onClick={downloadInvoice}>
                Télécharger la facture
            </button>)}
        </div>
    );
}

export default Commande;