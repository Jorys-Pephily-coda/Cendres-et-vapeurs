import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import api from '../services/api'

export default function Login() {
  const { login } = useContext(AuthContext)
  const navigate  = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setError('')
    setLoading(true)

    console.log('[Login] Tentative avec :', email)

    try {
      const res = await api.post('/auth/login', { email, password })
      console.log('[Login] Succès :', res.data)
      login(res.data.access_token, res.data.user)
      navigate('/shop')
    } catch (err) {
      console.error('[Login] Erreur :', err.response?.data || err.message)
      setError(err.response?.data?.detail || 'Erreur de connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <h1>Connexion</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="text"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@colony.local"
          style={{ padding: '8px', fontSize: '14px' }}
        />

        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={{ padding: '8px', fontSize: '14px' }}
        />

        {error && (
          <p style={{ color: 'red' }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ padding: '10px', cursor: 'pointer', fontSize: '14px' }}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </div>

      <p style={{ marginTop: '16px' }}>
        Pas encore de compte ? <Link to="/register">S'inscrire</Link>
      </p>
    </main>
  )
}