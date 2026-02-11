import { useState, useEffect, useRef, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

const WS_URL = import.meta.env.VITE_WS_URL

export default function Chat() {
  const { user, token } = useContext(AuthContext)
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [connected, setConnected] = useState(false)
  const [wsError, setWsError]     = useState('')
  const wsRef     = useRef(null)
  const bottomRef = useRef(null)
  const currentToken = token || sessionStorage.getItem('token')

  useEffect(() => {
    if (!currentToken) return
    connect()
    return () => {
      if (wsRef.current) {
        wsRef.current.shouldReconnect = false
        wsRef.current.close()
      }
    }
  }, [currentToken])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const connect = () => {
    const url = `${WS_URL}/chat?token=${currentToken}`
    const ws  = new WebSocket(url)
    ws.shouldReconnect = true

    ws.onopen = () => {
      setConnected(true)
      setWsError('')
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setMessages(prev => [...prev, data])
      } catch {}
    }

    ws.onclose = (event) => {
      setConnected(false)
      // Code 1008 = refus de politique (403) — ne pas reconnecter
      if (event.code === 1008) {
        setWsError('Accès refusé — rôle editor ou admin requis.')
        return
      }
      if (ws.shouldReconnect) {
        setTimeout(connect, 3000)
      }
    }

    ws.onerror = () => {
      ws.close()
    }

    wsRef.current = ws
  }

  const sendMessage = () => {
    if (!input.trim() || !connected) return
    wsRef.current.send(JSON.stringify({ content: input.trim() }))
    setInput('')
  }

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <main>
      <h1>Télégraphe de l'Ombre</h1>

      <p role="status" aria-live="polite">
        {wsError
          ? `⛔ ${wsError}`
          : connected ? '🟢 Connecté' : '🔴 Connexion en cours...'}
      </p>

      <section role="log" aria-label="Messages du chat" aria-live="polite">
        <ul role="list">
          {messages.map((msg, i) => (
            <li key={i} className={msg.sender_email === user?.email ? 'own' : 'other'}>
              <strong>{msg.sender_email}</strong>
              <time dateTime={msg.created_at}> [{formatTime(msg.created_at)}]</time>
              <p>{msg.content}</p>
            </li>
          ))}
        </ul>
        <div ref={bottomRef} />
      </section>

      <form onSubmit={(e) => { e.preventDefault(); sendMessage() }}>
        <label htmlFor="chat-input">Message</label>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Votre message..."
          disabled={!connected}
          aria-label="Saisir un message"
        />
        <button type="submit" disabled={!connected || !input.trim()}>
          Envoyer
        </button>
      </form>
    </main>
  )
}