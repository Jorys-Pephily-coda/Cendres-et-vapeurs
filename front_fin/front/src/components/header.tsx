import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTransition } from "../assets/transition/transition";
import "../styles/header.css";

export default function Header() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { TransitionOverlay, triggerTransition } = useTransition();

  const handleNav = (path: string, useTransitionEffect: boolean = true) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (path === location.pathname) return;
    if (useTransitionEffect) {
      triggerTransition(() => navigate(path));
    } else {
      navigate(path);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/auth/logout/', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      sessionStorage.clear();
      setUser(null);
      triggerTransition(() => navigate('/login'));
    }
  };

  return (
    <>
      <TransitionOverlay />
      <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" onClick={handleNav("/")} className="navbar-brand">
          <span className="brand-text">Cendres et Vapeur</span>
        </Link>

        <ul className="navbar-nav">
          <li>
            <Link to="/" onClick={handleNav("/")}>Accueil</Link>
          </li>
          <li>
            <Link to="/commerce" onClick={handleNav("/commerce")}>Boutique</Link>
          </li>
          <li>
            <Link to="/planning" onClick={handleNav("/planning")}>Planning</Link>
          </li>
          <li>
            <Link to="/toxicite" onClick={handleNav("/toxicite")}>Toxicité</Link>
          </li>
          <li>
            <Link to="/log" onClick={handleNav("/log")}>Journal</Link>
          </li>
          <li>
            <Link to="/contact" onClick={handleNav("/contact")}>Contact</Link>
          </li>

          {user ? (
            <li>
              <Link to="/panier" onClick={handleNav("/panier")} className="nav-icon" title="Panier">
          Panier
              </Link>
            </li>
          ) : (
            <li></li>
          )}

          {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
            <li>
              <Link to="/chat" onClick={handleNav("/chat")}>Chat</Link>
            </li>
          )}
          {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
            <li className="admin">
              <Link to="/dashboard" onClick={handleNav("/dashboard")}>dashboard</Link>
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
                onClick={handleLogout}
                className="btn-ghost btn-sm"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="sign">
              <Link to="/login" onClick={handleNav("/login", false)} className="btn-copper btn-sm">
                Connexion
              </Link>
              <Link to="/register" onClick={handleNav("/register", false)} className="btn-copper btn-sm">
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
    </>
  );
}
