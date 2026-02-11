import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function DiscountCodes() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [codes, setCodes] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        minimum_order: '',
        max_uses: '',
        valid_from: '',
        valid_until: '',
        is_active: true,
    });

    useEffect(() => {
        if (user?.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchCodes();
    }, [user, navigate]);

    const fetchCodes = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/discounts/', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setCodes(data.results || data);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/discounts/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                fetchCodes();
                resetForm();
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Supprimer ce code promo ?')) return;
        try {
            const response = await fetch(`http://localhost:8000/api/discounts/${id}/`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (response.ok) {
                fetchCodes();
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            discount_type: 'percentage',
            discount_value: '',
            minimum_order: '',
            max_uses: '',
            valid_from: '',
            valid_until: '',
            is_active: true,
        });
        setShowForm(false);
    };

    return (
        <div>
            <h1>Gestion des Codes Promo</h1>
            <button onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Annuler' : 'Nouveau Code'}
            </button>

            {showForm && (
                <form onSubmit={handleSubmit}>
                    <h2>Créer Code Promo</h2>
                    <div>
                        <label>Code:</label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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
                        <label>Type:</label>
                        <select
                            value={formData.discount_type}
                            onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                        >
                            <option value="percentage">Pourcentage</option>
                            <option value="fixed">Montant fixe</option>
                        </select>
                    </div>
                    <div>
                        <label>Valeur:</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.discount_value}
                            onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Montant minimum:</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.minimum_order}
                            onChange={(e) => setFormData({ ...formData, minimum_order: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Utilisations max:</label>
                        <input
                            type="number"
                            value={formData.max_uses}
                            onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Valide du:</label>
                        <input
                            type="datetime-local"
                            value={formData.valid_from}
                            onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Valide jusqu'au:</label>
                        <input
                            type="datetime-local"
                            value={formData.valid_until}
                            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            />
                            Actif
                        </label>
                    </div>
                    <button type="submit">Créer</button>
                    <button type="button" onClick={resetForm}>Annuler</button>
                </form>
            )}

            <h2>Liste des Codes Promo</h2>
            <table border={1}>
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Valeur</th>
                        <th>Utilisations</th>
                        <th>Max</th>
                        <th>Actif</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {codes.map((c) => (
                        <tr key={c.id}>
                            <td>{c.code}</td>
                            <td>{c.discount_type}</td>
                            <td>{c.discount_value}</td>
                            <td>{c.uses_count}</td>
                            <td>{c.max_uses || 'Illimité'}</td>
                            <td>{c.is_active ? 'Oui' : 'Non'}</td>
                            <td>
                                <button onClick={() => handleDelete(c.id)}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DiscountCodes;
