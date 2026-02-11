import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    is_2fa_enabled: user?.is_2fa_enabled || false,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await updateProfile(formData);
      setMessage('Profil mis à jour avec succès');
    } catch (err) {
      setError('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Mon Profil</h1>
          <p className="page-subtitle">Gérez vos informations personnelles</p>
        </div>

        <div className="row">
          <div className="col-8">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Informations</h3>
              </div>
              <div className="card-body">
                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="username" className="form-label">
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      id="username"
                      className="form-control"
                      value={user?.username}
                      disabled
                    />
                    <small className="text-muted">
                      Le nom d'utilisateur ne peut pas être modifié
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="row">
                    <div className="col-6">
                      <div className="form-group">
                        <label htmlFor="first_name" className="form-label">
                          Prénom
                        </label>
                        <input
                          type="text"
                          id="first_name"
                          name="first_name"
                          className="form-control"
                          value={formData.first_name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="form-group">
                        <label htmlFor="last_name" className="form-label">
                          Nom
                        </label>
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          className="form-control"
                          value={formData.last_name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="is_2fa_enabled"
                        checked={formData.is_2fa_enabled}
                        onChange={handleChange}
                      />
                      {' '}Activer l'authentification à deux facteurs (2FA)
                    </label>
                    <small className="text-muted d-block">
                      Un code sera envoyé à votre email à chaque connexion
                    </small>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Mise à jour...' : 'Mettre à jour'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-4">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Statut</h3>
              </div>
              <div className="card-body">
                <div className="profile-info">
                  <p>
                    <strong>Rôle :</strong>{' '}
                    <span className={`badge badge-${user?.role}`}>
                      {user?.role}
                    </span>
                  </p>
                  <p>
                    <strong>Membre depuis :</strong>{' '}
                    {user?.created_at && new Date(user.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </p>
                  <p>
                    <strong>2FA :</strong>{' '}
                    {user?.is_2fa_enabled ? (
                      <span className="text-success">✓ Activé</span>
                    ) : (
                      <span className="text-danger">✗ Désactivé</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="card mt-3">
              <div className="card-header">
                <h3 className="card-title">Permissions</h3>
              </div>
              <div className="card-body">
                <ul>
                  {user?.role === 'ADMIN' && (
                    <>
                      <li>✓ Gestion complète</li>
                      <li>✓ Gestion utilisateurs</li>
                      <li>✓ Gestion produits</li>
                      <li>✓ Codes promo</li>
                      <li>✓ Chat administratif</li>
                    </>
                  )}
                  {user?.role === 'EDITOR' && (
                    <>
                      <li>✓ Gestion produits</li>
                      <li>✓ Gestion calendrier</li>
                      <li>✓ Chat administratif</li>
                    </>
                  )}
                  {user?.role === 'USER' && (
                    <>
                      <li>✓ Achats et commandes</li>
                      <li>✓ Votes sur produits</li>
                      <li>✓ Notes personnelles</li>
                    </>
                  )}
                  {user?.role === 'GUEST' && (
                    <li className="text-muted">Lecture seule</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
