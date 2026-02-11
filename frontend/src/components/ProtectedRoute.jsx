import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

export default function ProtectedRoute({ roles = [] }) {
  const { user, loading } = useContext(AuthContext)

  // Attendre que la session soit restaurée avant de décider
  if (loading) {
    return <p aria-live="polite" style={{ textAlign: 'center', padding: '40px' }}>Chargement...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/shop" replace />
  }

  return <Outlet />
}