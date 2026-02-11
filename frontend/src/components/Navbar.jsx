import { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { CartContext } from '../contexts/CartContext'

export default function Navbar() {
  const { user, logout, hasRole } = useContext(AuthContext)
  const { getCount } = useContext(CartContext)
  const navigate = useNavigate()
  const cartCount = getCount()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header>
      <nav aria-label="Navigation principale">
        <NavLink to="/shop" aria-label="Accueil — Vitrine">
          ⚙ Cendres &amp; Vapeur
        </NavLink>

        <ul role="list">
          <li>
            <NavLink to="/shop" aria-label="Boutique">
              Vitrine
            </NavLink>
          </li>

          <li>
            <NavLink to="/market" aria-label="Bourse du cuivre">
              Bourse
            </NavLink>
          </li>

          <li>
            <NavLink to="/toxicity" aria-label="Moniteur de toxicité">
              Toxicité
            </NavLink>
          </li>

          <li>
            <NavLink to="/logs" aria-label="Journal des survivants">
              Journal
            </NavLink>
          </li>

          <li>
              <NavLink to="/calendar" aria-label="Calendrier de la colonie">
                Calendrier
              </NavLink>
          </li>

          {!hasRole(['editor', 'admin']) &&
            <li>
              <NavLink to="/contact" aria-label="Bureau de poste">
                Contact
              </NavLink>
            </li>
          }

          {hasRole(['editor', 'admin']) && (
            <>
              <li>
                <NavLink to="/chat" aria-label="Télégraphe interne">
                  Télégraphe
                </NavLink>
              </li>
              <li>
                <NavLink to="/communication" aria-label="Bureau de communication">
                  📡 Com
                </NavLink>
              </li>
            </>
          )}

          {hasRole(['admin']) && (
            <li>
              <NavLink to="/dashboard" aria-label="Dashboard administrateur">
                Dashboard
              </NavLink>
            </li>
          )}
        </ul>

        <ul role="list">
          {user ? (
            <>
              <li>
                <NavLink to="/cart" aria-label={`Panier — ${cartCount} article(s)`}>
                  Panier {cartCount > 0 && <span aria-hidden="true">({cartCount})</span>}
                </NavLink>
              </li>
              <li>
                <span aria-label={`Connecté en tant que ${user.email}`}>
                  {user.email}
                </span>
              </li>
              <li>
                <button onClick={handleLogout} aria-label="Se déconnecter">
                  Déconnexion
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/login" aria-label="Se connecter">
                  Connexion
                </NavLink>
              </li>
              <li>
                <NavLink to="/register" aria-label="Créer un compte">
                  Inscription
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  )
}