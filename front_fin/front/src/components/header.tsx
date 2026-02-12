import { Link } from "react-router-dom";
import '../styles/Header.css';

export default function Header() {
  const user = null;

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
            <Link to="/panier">Panier</Link>
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

          {/*{isEditor() && (
            <li>
              <Link to="/chat">Chat</Link>
            </li>
          )}
          {isAdmin() && (
            <li>
              <Link to="/admin">Admin</Link>
            </li>
          )}*/}
        </ul>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/cart" className="nav-icon" title="Panier">
                Panier
              </Link>
              <Link to="/profile" className="navbar-user">
                <span className="user-name">{/*user.username*/}</span>
                <span className={`badge badge-${/*user.role*/ "1"}`}>
                  {/*user.role*/}
                </span>
              </Link>
              <button
                onClick={/*logout*/ () => console.log("logout")}
                className="btn btn-secondary btn-sm"
              >
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
}
