import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register', {
        email: form.email,
        password: form.password,
      })
      navigate('/verify', { state: { email: form.email } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'inscription.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <h1>Inscription</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="text"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          aria-label="Adresse email"
        />

        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          aria-label="Mot de passe"
        />

        <label htmlFor="confirm">Confirmer le mot de passe</label>
        <input
          id="confirm"
          type="password"
          name="confirm"
          value={form.confirm}
          onChange={handleChange}
          required
          aria-label="Confirmer le mot de passe"
        />

        {error && <p role="alert" className="error">{error}</p>}

        <button type="submit" disabled={loading} aria-busy={loading}>
          {loading ? 'Inscription...' : "S'inscrire"}
        </button>
      </form>

      <p>
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </main>
  )
}