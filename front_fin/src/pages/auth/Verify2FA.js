import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Verify2FA = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { verify2FA } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verify2FA(username, code);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  if (!username) {
    navigate('/login');
    return null;
  }

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-card card">
            <div className="auth-header">
              <h1>Vérification 2FA</h1>
              <p>Un code a été envoyé à votre email</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="code" className="form-label">
                  Code de vérification
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  className="form-control"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  required
                  autoFocus
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
                <small className="text-muted">
                  Entrez le code à 6 chiffres reçu par email
                </small>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Vérification...' : 'Vérifier'}
              </button>
            </form>

            <div className="auth-footer">
              <p className="text-muted">
                <small>Le code expire après 5 minutes</small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify2FA;
