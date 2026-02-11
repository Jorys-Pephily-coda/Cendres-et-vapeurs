import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import api from '../services/api'

export default function Contact() {
  const { user, hasRole } = useContext(AuthContext)
  const [form, setForm]         = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [conversation, setConversation] = useState([])

  const isStaff = hasRole(['editor', 'admin'])

  useEffect(() => {
    if (user && !isStaff) {
      fetchConversation()
    }
  }, [user, isStaff])

  const fetchConversation = async () => {
    try {
      const res = await api.get('contact/my-messages')
      setConversation(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('')
    setLoading(true)
    try {
      await api.post('contact/', form)
      setStatus('Message envoyé avec succès.')
      setForm({ name: '', email: '', subject: '', message: '' })
      fetchConversation()
    } catch (err) {
      setStatus('Erreur lors de l\'envoi. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (isStaff) {
    return (
      <main>
        <h1>Contact</h1>
        <p style={{ color: '#c8860a' }}>
          ⚠️ Vous êtes membre du personnel. Le formulaire de contact est réservé aux utilisateurs.
        </p>
        <p>Pour toute communication interne, utilisez le <strong>Chat</strong> ou <strong>📡 Communication</strong>.</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Bureau de Poste</h1>
      <p>Transmettez vos demandes à la guilde marchande.</p>

      {/* Afficher la conversation existante */}
      {conversation.length > 0 && (
        <section style={{ marginBottom: '30px', padding: '20px', border: '1px solid #b87333', borderRadius: '4px' }}>
          <h2>Vos messages</h2>
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            {conversation.map(msg => (
              <div
                key={msg.id}
                style={{
                  padding: '15px',
                  marginBottom: '10px',
                  background: msg.sender_type === 'editor' ? '#1a3a1a' : '#1a1612',
                  border: '1px solid #b87333',
                  borderRadius: '4px',
                }}
              >
                <div style={{ fontSize: '12px', color: '#9a8e78', marginBottom: '5px' }}>
                  <strong>{msg.sender_type === 'editor' ? '👤 Guilde Marchande' : '📨 Vous'}</strong> — {new Date(msg.created_at).toLocaleString('fr-FR')}
                </div>
                {msg.subject && <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#c8860a' }}>{msg.subject}</div>}
                <div style={{ whiteSpace: 'pre-wrap', color: '#d4c9a8' }}>{msg.content}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <h2>Nouveau message</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Nom</label>
        <input
          id="name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          aria-label="Votre nom"
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          aria-label="Votre email"
        />

        <label htmlFor="subject">Sujet</label>
        <input
          id="subject"
          type="text"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          required
          aria-label="Sujet du message"
        />

        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={6}
          required
          aria-label="Votre message"
        />

        {status && <p role="status" className={status.includes('succès') ? 'success' : 'error'}>{status}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>
    </main>
  )
}