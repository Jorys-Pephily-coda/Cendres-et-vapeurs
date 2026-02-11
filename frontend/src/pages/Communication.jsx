import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import api from '../services/api'

export default function Communication() {
  const { hasRole } = useContext(AuthContext)
  const [conversations, setConversations] = useState([])
  const [codes, setCodes]                 = useState([])
  const [activeTab, setActiveTab]         = useState(hasRole(['editor']) ? 'messages' : 'codes')
  const [selectedThread, setSelectedThread] = useState(null)
  const [replyContent, setReplyContent]   = useState('')
  const [loading, setLoading]             = useState(false)

  const isEditor = hasRole(['editor'])

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'messages' && isEditor) {
        const res = await api.get('communications/conversations')
        setConversations(res.data)
      } else if (activeTab === 'codes') {
        const res = await api.get('communications/discount-codes')
        setCodes(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    try {
      await api.post('communications/reply', {
        thread_id: selectedThread.thread_id,
        content: replyContent,
      })
      setReplyContent('')
      setSelectedThread(null)
      fetchData()
    } catch (err) {
      alert('Erreur lors de l\'envoi')
    }
  }

  return (
    <main>
      <h1>📡 Bureau de Communication</h1>

      <nav role="tablist" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {isEditor && (
          <button
            role="tab"
            aria-selected={activeTab === 'messages'}
            onClick={() => setActiveTab('messages')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'messages' ? '#c8860a' : 'transparent',
              color: activeTab === 'messages' ? '#0d0b08' : '#d4c9a8',
              border: '1px solid #b87333',
              cursor: 'pointer',
            }}
          >
            Messages reçus
          </button>
        )}
        <button
          role="tab"
          aria-selected={activeTab === 'codes'}
          onClick={() => setActiveTab('codes')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'codes' ? '#c8860a' : 'transparent',
            color: activeTab === 'codes' ? '#0d0b08' : '#d4c9a8',
            border: '1px solid #b87333',
            cursor: 'pointer',
          }}
        >
          Codes de réduction
        </button>
      </nav>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <section role="tabpanel">
          {activeTab === 'messages' && isEditor && (
            <>
              <h2>Conversations</h2>
              {conversations.length === 0 ? (
                <p>Aucune conversation.</p>
              ) : (
                <ul role="list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {conversations.map(conv => (
                    <li key={conv.thread_id} style={{ padding: '15px', border: '1px solid #b87333', borderRadius: '4px' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>De :</strong> {conv.user_email}<br />
                        <strong>Dernier sujet :</strong> {conv.last_subject}<br />
                        <strong>Dernière mise à jour :</strong> {new Date(conv.last_updated).toLocaleString('fr-FR')}
                      </div>
                      <button
                        onClick={() => setSelectedThread(conv)}
                        style={{
                          padding: '8px 16px',
                          background: '#c8860a',
                          color: '#0d0b08',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        📧 Répondre ({conv.messages.length} messages)
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {activeTab === 'codes' && (
            <>
              <h2>Codes de réduction actifs</h2>
              {codes.length === 0 ? (
                <p>Aucun code disponible.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Réduction</th>
                      <th>Utilisations</th>
                      <th>Max</th>
                      <th>Disponible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.code}</strong></td>
                        <td>{c.percent}%</td>
                        <td>{c.uses}</td>
                        <td>{c.max_uses}</td>
                        <td>{c.uses < c.max_uses ? '✓ Oui' : '✗ Épuisé'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </section>
      )}

      {/* Modal de réponse */}
      {selectedThread && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedThread(null)}
        >
          <div
            style={{
              background: '#0d0b08',
              border: '2px solid #b87333',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Conversation avec {selectedThread.user_email}</h2>

            <div style={{ marginBottom: '20px', maxHeight: '300px', overflow: 'auto' }}>
              {selectedThread.messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    padding: '10px',
                    marginBottom: '10px',
                    background: msg.sender_type === 'editor' ? '#1a3a1a' : '#1a1612',
                    border: '1px solid #b87333',
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#9a8e78', marginBottom: '5px' }}>
                    <strong>{msg.sender_type === 'editor' ? '👤 Vous' : '📨 User'}</strong> — {new Date(msg.created_at).toLocaleString('fr-FR')}
                  </div>
                  {msg.subject && <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{msg.subject}</div>}
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleReply}>
              <label htmlFor="reply-content">Votre réponse</label>
              <textarea
                id="reply-content"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={6}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ padding: '10px 20px', background: '#c8860a', color: '#0d0b08', border: 'none', cursor: 'pointer' }}>
                  Envoyer
                </button>
                <button type="button" onClick={() => setSelectedThread(null)} style={{ padding: '10px 20px', background: '#6a5e48', color: '#d4c9a8', border: 'none', cursor: 'pointer' }}>
                  Fermer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}