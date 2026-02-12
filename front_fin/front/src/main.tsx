import { createRoot } from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import './index.css'
import Login from './pages/Login'
import Register from './pages/Register'
import A2f from './pages/A2f'
import Chat from './pages/Chat'
import Commerce from './pages/Commerce'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import Log from './pages/Log'
import Panier from './pages/Panier'
import Planning from './pages/Planning'
import Toxicite from './pages/Toxicite'
import Home from './pages/Home'
import Bourse from './pages/Bourse'
import Commande from './pages/Commande'
import { AuthProvider } from './context/AuthContext'
import AuthMiddleware from './middleware/Authmiddleware'
import Users from './pages/dashboard/Users'
import Products from './pages/dashboard/Products'
import DiscountCodes from './pages/dashboard/DiscountCodes'
import Orders from './pages/dashboard/Orders'
import Layout from './components/Layout'


const router = createBrowserRouter([
  { 
    path: '/',
    element: <Layout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/a2f', element: <A2f /> },
      
      { path: '/', element: <Home /> },
      { path: '/chat', element: <AuthMiddleware><Chat /></AuthMiddleware> },
      { path: '/commerce', element: <Commerce />},
      { path: '/contact', element: <Contact />},
      { path: '/dashboard', element: <AuthMiddleware><Dashboard /></AuthMiddleware> },
      { path: '/dashboard/users', element: <AuthMiddleware><Users /></AuthMiddleware> },
      { path: '/dashboard/products', element: <AuthMiddleware><Products /></AuthMiddleware> },
      { path: '/dashboard/discount-codes', element: <AuthMiddleware><DiscountCodes /></AuthMiddleware> },
      { path: '/dashboard/orders', element: <AuthMiddleware><Orders /></AuthMiddleware> },
      { path: '/log', element: <AuthMiddleware><Log /></AuthMiddleware> },
      { path: '/panier', element: <AuthMiddleware><Panier /></AuthMiddleware> },
      { path: '/commande', element: <AuthMiddleware><Commande /></AuthMiddleware> },
      { path: '/planning', element: <AuthMiddleware><Planning /></AuthMiddleware> },
      { path: '/toxicite', element: <AuthMiddleware><Toxicite /></AuthMiddleware> },
      { path: '/bourse', element: <AuthMiddleware><Bourse /></AuthMiddleware> },
    ]
  },
])

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
)