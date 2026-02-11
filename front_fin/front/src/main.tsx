import { createRoot } from 'react-dom/client'
import {createBrowserRouter, createHashRouter, RouterProvider} from 'react-router-dom'
import './index.css'
import Login from './pages/Login'
import Register from './pages/Register'
import A2f from './pages/A2f'
import Chat from './pages/Chat'
import Commerce from './pages/Commerce'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import Log from './pages/Log'
import Paiement from './pages/Paiement'
import Panier from './pages/Panier'
import Planning from './pages/Planning'
import Toxicite from './pages/Toxicite'
import Home from './pages/Home'
import { AuthProvider } from './context/AuthContext'
import AuthMiddleware from './middleware/Authmiddleware'


const router = createBrowserRouter([
  { 
    path: '/',
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/a2f', element: <A2f /> },
      
      { path: '/', element: <Home /> },
      { path: '/chat', element: <AuthMiddleware><Chat /></AuthMiddleware> },
      { path: '/commerce', element: <Commerce />},
      { path: '/contact', element: <Contact />},
      { path: '/dashboard', element: <AuthMiddleware><Dashboard /></AuthMiddleware> },
      { path: '/log', element: <AuthMiddleware><Log /></AuthMiddleware> },
      { path: '/paiement', element: <AuthMiddleware><Paiement /></AuthMiddleware> },
      { path: '/panier', element: <AuthMiddleware><Panier /></AuthMiddleware> },
      { path: '/planning', element: <AuthMiddleware><Planning /></AuthMiddleware> },
      { path: '/toxicite', element: <AuthMiddleware><Toxicite /></AuthMiddleware> },
    ]
  },
])

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
)