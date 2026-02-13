import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Products() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        base_price: '',
        current_price: '',
        stock: '',
        is_active: true,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (user?.role !== 'ADMIN' && user?.role !== 'EDITOR') {
            navigate('/');
            return;
        }
        fetchProducts();
    }, [user, navigate]);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/products/', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setProducts(data.results || data);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingProduct
            ? `http://localhost:8000/api/products/${editingProduct.id}/`
            : 'http://localhost:8000/api/products/';
        const method = editingProduct ? 'PATCH' : 'POST';

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('base_price', formData.base_price);
            formDataToSend.append('current_price', formData.current_price);
            formDataToSend.append('stock', formData.stock);
            formDataToSend.append('is_active', formData.is_active.toString());
            
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            const response = await fetch(url, {
                method,
                credentials: 'include',
                body: formDataToSend,
            });
            if (response.ok) {
                fetchProducts();
                resetForm();
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            category: product.category,
            base_price: product.base_price,
            current_price: product.current_price,
            is_active: product.is_active,
            stock: product.stock,
        });
        if (product.image) {
            setImagePreview(product.image);
        }
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Supprimer ce produit ?')) return;
        try {
            const response = await fetch(`http://localhost:8000/api/products/${id}/`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (response.ok) {
                fetchProducts();
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: '',
            base_price: '',
            current_price: '',
            is_active: true,
            stock: '',
        });
        setImageFile(null);
        setImagePreview(null);
        setEditingProduct(null);
        setShowForm(false);
    };

    return (
        <div className="page">
            <h1>Gestion des Produits</h1>
            <button onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Annuler' : 'Nouveau Produit'}
            </button>

            {showForm && (
                <form onSubmit={handleSubmit}>
                    <h2>{editingProduct ? 'Modifier' : 'Créer'} Produit</h2>
                    <div>
                        <label>Nom:</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Description:</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Catégorie:</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Prix de base:</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.base_price}
                            onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Prix actuel:</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.current_price}
                            onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Stock:</label>
                        <input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            />
                            {' '}Produit actif
                        </label>
                    </div>
                    <div>
                        <label>Image du produit:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {imagePreview && (
                            <div className="mt-sm">
                                <img 
                                    src={imagePreview} 
                                    alt="Aperçu" 
                                    className="img-preview"
                                />
                            </div>
                        )}
                    </div>
                    <button type="submit">
                        {editingProduct ? 'Mettre à jour' : 'Créer'}
                    </button>
                </form>
            )}

            <h2>Liste des Produits</h2>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Nom</th>
                        <th>Catégorie</th>
                        <th>Prix</th>
                        <th>Stock</th>
                        <th>Actif</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>
                                {p.image ? (
                                    <img 
                                        src={p.image} 
                                        alt={p.name} 
                                        className="img-thumbnail"
                                    />
                                ) : (
                                    'Pas d\'image'
                                )}
                            </td>
                            <td>{p.name}</td>
                            <td>{p.category}</td>
                            <td>{p.current_price}€</td>
                            <td>{p.stock}</td>
                            <td>{p.is_active ? 'Oui' : 'Non'}</td>
                            <td>
                                {p.is_active ? (
                                    <>
                                        <button onClick={() => handleEdit(p)}>Modifier</button>
                                        <button onClick={() => handleDelete(p.id)}>Désactiver</button>
                                    </>
                                ) : (
                                    <span style={{ color: '#888' }}>Produit désactivé</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Products;
