import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Users() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [editingUser, setEditingUser] = useState<any>(null);

    useEffect(() => {
        if (user?.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [user, navigate]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/users/', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data.results);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleUpdateRole = async (userId: number, newRole: string) => {
        try {
            const response = await fetch(`http://localhost:8000/api/users/${userId}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ role: newRole }),
            });
            if (response.ok) {
                fetchUsers();
                setEditingUser(null);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleDelete = async (userId: number) => {
        if (!confirm('Supprimer cet utilisateur ?')) return;
        try {
            const response = await fetch(`http://localhost:8000/api/users/${userId}/`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (response.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    return (
        <div className="page">
            <h1>Gestion des Utilisateurs</h1>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>A2F active</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.username}</td>
                            <td>{u.email}</td>
                            <td>
                                {editingUser === u.id ? (
                                    <select onChange={(e) => handleUpdateRole(u.id, e.target.value)}>
                                        <option value="GUEST" selected={u.role === 'GUEST'}>GUEST</option>
                                        <option value="USER" selected={u.role === 'USER'}>USER</option>
                                        <option value="EDITOR" selected={u.role === 'EDITOR'}>EDITOR</option>
                                        <option value="ADMIN" selected={u.role === 'ADMIN'}>ADMIN</option>
                                    </select>
                                ) : (
                                    <span>{u.role}</span>
                                )}
                            </td>
                            <td>{u.is_2fa_enabled ? 'Oui' : 'Non'}</td>
                            <td>
                                <button onClick={() => setEditingUser(u.id)}>Modifier rôle</button>
                                <button onClick={() => handleDelete(u.id)}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Users;
