import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

// Pages publiques
import Login from './pages/Login'
import Register from './pages/Register'
import TwoFactor from './pages/TwoFactor'
import Shop from './pages/Shop'
import Contact from './pages/Contact'
import Logs from './pages/Logs'

// Pages protégées (user+)
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Calendar from './pages/Calendar'

// Pages réservées (admin/editor)
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Communication from './pages/Communication'

// Bonus
import Toxicity from './pages/Toxicity'
import Market from './pages/Market'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            {/* Publiques */}
            <Route path="/" element={<Navigate to="/shop" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<TwoFactor />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/toxicity" element={<Toxicity />} />
            <Route path="/market" element={<Market />} />

            {/* Protégées : rôle user minimum */}
            <Route element={<ProtectedRoute roles={['user', 'editor', 'admin']} />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/calendar" element={<Calendar />} />
            </Route>

            {/* Protégées : rôle editor ou admin */}
            <Route element={<ProtectedRoute roles={['editor', 'admin']} />}>
              <Route path="/chat" element={<Chat />} />
              <Route path="/communication" element={<Communication />} />
            </Route>

            {/* Protégées : rôle admin uniquement */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/shop" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App