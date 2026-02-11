import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      const errors = err.response?.data;
      if (typeof errors === 'object') {
        const errorMessages = Object.values(errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError('Erreur lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-card card">
            <div className="auth-header">
              <h1>⚙ Inscription ⚙</h1>
              <p>Rejoignez la Zone Franche</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-control"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Votre identifiant"
                  required
                  autoFocus
                />
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
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password_confirm" className="form-label">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  id="password_confirm"
                  name="password_confirm"
                  className="form-control"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Inscription en cours...
                  </>
                ) : (
                  'S\'inscrire'
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Déjà membre ? <Link to="/login">Se connecter</Link>
              </p>
            </div>
          </div>

          <div className="auth-info card">
            <h3>Bienvenue dans la Guilde</h3>
            <p>En vous inscrivant, vous aurez accès à :</p>
            <ul>
              <li>✓ Boutique et système de troc</li>
              <li>✓ Panier et commandes</li>
              <li>✓ Votes sur les produits</li>
              <li>✓ Notes personnelles</li>
              <li>✓ Historique de commandes</li>
            </ul>
            <p className="text-muted">
              <small>Votre rôle initial sera "Invité". Un administrateur peut vous promouvoir.</small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
