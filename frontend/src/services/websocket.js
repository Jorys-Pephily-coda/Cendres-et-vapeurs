const WS_URL = import.meta.env.VITE_WS_URL

class WebSocketManager {
  constructor() {
    this.socket = null
    this.listeners = new Map()   // event → Set de callbacks
    this.reconnectDelay = 3000
    this.reconnectTimer = null
    this.shouldReconnect = false
    this.endpoint = null
    this.token = null
  }

  connect(endpoint, token) {
    this.endpoint = endpoint
    this.token = token
    this.shouldReconnect = true
    this._open()
  }

  _open() {
    const url = `${WS_URL}/${this.endpoint}?token=${this.token}`
    this.socket = new WebSocket(url)

    this.socket.onopen = () => {
      this._emit('open')
      // Annuler tout timer de reconnexion en cours
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }
    }

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this._emit('message', data)
      } catch {
        this._emit('message', event.data)
      }
    }

    this.socket.onclose = () => {
      this._emit('close')
      if (this.shouldReconnect) {
        this.reconnectTimer = setTimeout(() => this._open(), this.reconnectDelay)
      }
    }

    this.socket.onerror = (err) => {
      this._emit('error', err)
      this.socket.close()
    }
  }

  send(data) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket non connecté — message non envoyé.')
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)
  }

  off(event, callback) {
    this.listeners.get(event)?.delete(callback)
  }

  disconnect() {
    this.shouldReconnect = false
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.socket?.close()
    this.socket = null
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN
  }

  _emit(event, data) {
    this.listeners.get(event)?.forEach((cb) => cb(data))
  }
}

// Instance singleton exportée — une seule connexion WS active à la fois
export const wsManager = new WebSocketManager()

// Hook utilitaire pour React
import { useEffect, useState } from 'react'

export function useWebSocket(endpoint, token) {
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (!endpoint || !token) return

    wsManager.connect(endpoint, token)

    const onOpen  = ()    => setConnected(true)
    const onClose = ()    => setConnected(false)
    const onMsg   = (msg) => setMessages((prev) => [...prev, msg])

    wsManager.on('open',    onOpen)
    wsManager.on('close',   onClose)
    wsManager.on('message', onMsg)

    return () => {
      wsManager.off('open',    onOpen)
      wsManager.off('close',   onClose)
      wsManager.off('message', onMsg)
      wsManager.disconnect()
    }
  }, [endpoint, token])

  const send = (data) => wsManager.send(data)

  return { connected, messages, send }
}