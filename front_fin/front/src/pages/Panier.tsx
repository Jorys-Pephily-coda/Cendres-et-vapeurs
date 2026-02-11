import { useEffect, useState } from 'react';

function Panier() {
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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


    if (loading) return <div>Chargement...</div>;

    return (
        <div>
            <h1>Mon Panier</h1>
            
            {!cart || cart.items.length === 0 ? (
                <p>Votre panier est vide</p>
            ) : (
                <>
                    <table border={1}>
                        <thead>
                            <tr>
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
                                    <td>{item.product.name}</td>
                                    <td>{item.product.current_price}€</td>
                                    <td>
                                        <input
                                            type="number"
                                            min="1"
                                            max={item.product.stock}
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                            style={{ width: '60px' }}
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

                    <div style={{ marginTop: '20px' }}>
                        <p><strong>Nombre d'articles: {cart.items_count}</strong></p>
                        <p><strong>Total: {cart.total}€</strong></p>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <button style={{ padding: '10px 20px', marginRight: '10px' }}>
                            Payer
                        </button>
                        <button onClick={clearCart}>Vider le panier</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Panier;