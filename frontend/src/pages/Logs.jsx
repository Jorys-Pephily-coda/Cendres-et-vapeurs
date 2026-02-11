import { useState, useEffect } from 'react'
import api from '../services/api'

const ACTION_LABELS = {
  login: '🔓 connexion',
  logout: '🔒 déconnexion',
  purchase: '🛒 achat',
  vote: '⭐ vote',
  register: '📋 inscription',
  note_added: '📝 note ajoutée',
  product_viewed: '👁 consultation',
}

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const LIMIT = 20

  useEffect(() => {
    fetchLogs(1)
  }, [])

  const fetchLogs = async (p) => {
    setLoading(true)
    try {
      const res = await api.get(`/logs?page=${p}&limit=${LIMIT}`)
      if (p === 1) {
        setLogs(res.data)
      } else {
        setLogs(prev => [...prev, ...res.data])
      }
      setHasMore(res.data.length === LIMIT)
      setPage(p)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <main>
      <h1>Journal des Survivants</h1>
      <p>Flux des dernières actions de la colonie.</p>

      {logs.length === 0 && !loading && (
        <p>Aucune activité enregistrée.</p>
      )}

      <ul role="list" aria-label="Journal des actions" aria-live="polite">
        {logs.map((log) => (
          <li key={log.id}>
            <time dateTime={log.created_at}>{formatDate(log.created_at)}</time>
            <span> — </span>
            <span>{ACTION_LABELS[log.action] || log.action}</span>
            {log.entity && <span> sur <em>{log.entity}</em></span>}
            {log.user_email && <span> par <strong>{log.user_email}</strong></span>}
          </li>
        ))}
      </ul>

      {loading && <p aria-live="polite">Chargement...</p>}

      {hasMore && !loading && (
        <button
          onClick={() => fetchLogs(page + 1)}
          aria-label="Charger plus d'entrées du journal"
        >
          Charger plus
        </button>
      )}
    </main>
  )
}