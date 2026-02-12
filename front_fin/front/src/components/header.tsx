import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/header.css";

export default function Header() {
  const { user } = useAuth();
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-text">Cendres et Vapeur</span>
        </Link>

        <ul className="navbar-nav">
          <li>
            <Link to="/">Accueil</Link>
          </li>
          <li>
            <Link to="/commerce">Boutique</Link>
          </li>
          <li>
            <Link to="/planning">Planning</Link>
          </li>
          <li>
            <Link to="/toxicite">Toxicité</Link>
          </li>
          <li>
            <Link to="/log">Journal</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>

          {user ? (
            <li>
              <Link to="/cart" className="nav-icon" title="Panier">
          Panier
              </Link>
            </li>
          ) : (
            <li></li>
          )}

          {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
            <li>
              <Link to="/chat">Chat</Link>
            </li>
          )}
          {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
            <li className="admin">
              <Link to="/dashboard">dashboard</Link>
              <span className={`badge badge-${user?.role}`}>
              </span>
            </li>
          )}

            {user && (
            <li className="user-info">
              <span>Bonjour, {user.username}</span>
            </li>
            )}
        </ul>

        <div className="navbar-actions">
          {user ? (
            <div className="sign">
              <button
                onClick={/*logout*/ () => console.log("logout")}
                className="btn btn-secondary btn-sm"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="sign">
              <Link to="/login" className="btn btn-secondary btn-sm">
                Connexion
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
