import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './Admin.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/');
      setUsers(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/`, { role: newRole });
      fetchUsers();
      alert('Rôle modifié avec succès');
    } catch (err) {
      alert('Erreur lors de la modification du rôle');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;

    try {
      await api.delete(`/users/${userId}/`);
      fetchUsers();
      alert('Utilisateur supprimé');
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const roles = [
    { value: 'GUEST', label: 'Invité' },
    { value: 'USER', label: 'Utilisateur' },
    { value: 'EDITOR', label: 'Éditeur' },
    { value: 'ADMIN', label: 'Administrateur' },
  ];

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
          <h1 className="page-title">Gestion des Utilisateurs</h1>
          <p className="page-subtitle">{users.length} membre(s)</p>
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom d'utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>2FA</th>
                <th>Date d'inscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td><strong>{user.username}</strong></td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      className="form-control form-control-sm"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {user.is_2fa_enabled ? (
                      <span className="text-success">✓</span>
                    ) : (
                      <span className="text-muted">✗</span>
                    )}
                  </td>
                  <td>
                    {new Date(user.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
