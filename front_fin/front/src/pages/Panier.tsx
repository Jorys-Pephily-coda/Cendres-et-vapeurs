import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Panier() {
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/cart/', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setCart(data);
            }
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId: number, newQuantity: number) => {
        try {
            const response = await fetch(`http://localhost:8000/api/cart/${itemId}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ quantity: newQuantity }),
            });
            if (response.ok) {
                const data = await response.json();
                setCart(data);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const removeItem = async (itemId: number) => {
        try {
            const response = await fetch(`http://localhost:8000/api/cart/${itemId}/remove/`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setCart(data);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const clearCart = async () => {
        if (!confirm('Vider le panier ?')) return;
        try {
            const response = await fetch('http://localhost:8000/api/cart/clear/', {
                method: 'DELETE',
                credentials: 'include',
            });
            if (response.ok) {
                fetchCart();
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handlePay = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/orders/create/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({}),
            });
            if (response.ok) {
                const data = await response.json();
                navigate(`/commande?orderId=${data.order.id}`);
            } else {
                const error = await response.json();
                alert(error.error || 'Erreur lors de la création de la commande');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la création de la commande');
        }
    };


    if (loading) return <div>Chargement...</div>;

    return (
        <div className="page">
            <h1>Mon Panier</h1>
            
            {!cart || cart.items.length === 0 ? (
                <p>Votre panier est vide</p>
            ) : (
                <>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Produit</th>
                                <th>Prix unitaire</th>
                                <th>Quantité</th>
                                <th>Sous-total</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.items.map((item: any) => (
                                <tr key={item.id}>
                                    <td>
                                        {item.product.image ? (
                                            <img 
                                                src={`http://localhost:8000${item.product.image}`} 
                                                alt={item.product.name}
                                                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                        ) : (
                                            <div style={{ width: '60px', height: '60px', backgroundColor: '#333', borderRadius: '4px' }}></div>
                                        )}
                                    </td>
                                    <td>{item.product.name}</td>
                                    <td>{item.product.current_price}€</td>
                                    <td>
                                        <input
                                            type="number"
                                            min="1"
                                            max={item.product.stock}
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                            className="quantity-input"
                                        />
                                    </td>
                                    <td>{item.subtotal}€</td>
                                    <td>
                                        <button onClick={() => removeItem(item.id)}>Supprimer</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-lg">
                        <p><strong>Nombre d'articles: {cart.items_count}</strong></p>
                        <p><strong>Total: {cart.total}€</strong></p>
                    </div>

                    <div className="mt-lg flex-row gap-sm">
                        <button className="btn-copper" onClick={handlePay}>
                            Payer
                        </button>
                        <button className="btn-danger" onClick={clearCart}>Vider le panier</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Panier;