import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'

export default function TwoFactor() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/verify-otp', { email, code })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Code invalide ou expiré.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { email })
      setResent(true)
    } catch {
      setError('Impossible de renvoyer le code.')
    }
  }

  return (
    <main>
      <h1>Vérification 2FA</h1>
      <p>Un code a été envoyé à <strong>{email}</strong>.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="code">Code de vérification</label>
        <input
          id="code"
          type="text"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          required
          autoComplete="one-time-code"
          aria-label="Code OTP reçu par email"
        />

        {error && <p role="alert" className="error">{error}</p>}
        {resent && <p className="success">Code renvoyé !</p>}

        <button type="submit" disabled={loading} aria-busy={loading}>
          {loading ? 'Vérification...' : 'Valider'}
        </button>
      </form>

      <button onClick={handleResend} aria-label="Renvoyer le code OTP">
        Renvoyer le code
      </button>
    </main>
  )
}