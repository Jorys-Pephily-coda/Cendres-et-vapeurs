import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin, isEditor } = useAuth();

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">⚙</span>
          <span className="brand-text">Cendres et Vapeur</span>
          <span className="brand-icon">⚙</span>
        </Link>

        <ul className="navbar-nav">
          <li><Link to="/">Accueil</Link></li>
          <li><Link to="/products">Boutique</Link></li>
          <li><Link to="/calendar">Planning</Link></li>
          <li><Link to="/monitoring">Toxicité</Link></li>
          <li><Link to="/logs">Journal</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          
          {isEditor() && <li><Link to="/chat">Chat</Link></li>}
          {isAdmin() && <li><Link to="/admin">Admin</Link></li>}
        </ul>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/cart" className="nav-icon" title="Panier">
                🛒
              </Link>
              <Link to="/profile" className="navbar-user">
                <span className="user-name">{user.username}</span>
                <span className={`badge badge-${user.role}`}>{user.role}</span>
              </Link>
              <button onClick={logout} className="btn btn-secondary btn-sm">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Connexion
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
