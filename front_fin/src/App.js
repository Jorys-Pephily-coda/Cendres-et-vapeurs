import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Verify2FA from './pages/auth/Verify2FA';
import Profile from './pages/auth/Profile';

import ProductList from './pages/products/ProductList';
import ProductDetail from './pages/products/ProductDetail';
import Cart from './pages/ecommerce/Cart';
import Checkout from './pages/ecommerce/Checkout';
import OrderList from './pages/ecommerce/OrderList';
import OrderDetail from './pages/ecommerce/OrderDetail';

import Calendar from './pages/calendar/Calendar';
import Chat from './pages/chat/Chat';
import Monitoring from './pages/monitoring/Monitoring';
import Contact from './pages/contact/Contact';
import Logs from './pages/logs/Logs';

import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ProductManagement from './pages/admin/ProductManagement';
import DiscountManagement from './pages/admin/DiscountManagement';

import './App.css';

// Route protégée
const ProtectedRoute = ({ children, requireAuth = true, requireAdmin = false, requireEditor = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user?.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }

  if (requireEditor && !['EDITOR', 'ADMIN'].includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-2fa" element={<Verify2FA />} />
            
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrderList /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/chat" element={<ProtectedRoute requireEditor><Chat /></ProtectedRoute>} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/logs" element={<Logs />} />
            
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            <Route path="/admin" element={<ProtectedRoute requireAdmin><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute requireEditor><ProductManagement /></ProtectedRoute>} />
            <Route path="/admin/discounts" element={<ProtectedRoute requireAdmin><DiscountManagement /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
