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


const router = createBrowserRouter([
  { 
    path: '/',
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/a2f', element: <A2f /> },
      { path: '/chat', element: <Chat /> },
      { path: '/commerce', element: <Commerce /> },
      { path: '/contact', element: <Contact /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/log', element: <Log /> },
      { path: '/paiement', element: <Paiement /> },
      { path: '/panier', element: <Panier /> },
      { path: '/planning', element: <Planning /> },
      { path: '/toxicite', element: <Toxicite /> },
    ]
  },
])

createRoot(document.getElementById('root')!).render(

    <RouterProvider router={router} />

)