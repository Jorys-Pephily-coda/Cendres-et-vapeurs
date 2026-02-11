import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import './Chat.css';

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const pollingInterval = useRef(null);

  useEffect(() => {
    loadMessages();
    
    // Polling toutes les 2 secondes pour les nouveaux messages
    pollingInterval.current = setInterval(() => {
      loadNewMessages();
    }, 2000);
    
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  const loadMessages = async () => {
    try {
      const response = await api.get('/chat/messages/');
      const data = response.data.results || response.data;
      setMessages(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading messages:', err);
      setLoading(false);
    }
  };

  const loadNewMessages = async () => {
    try {
      if (messages.length === 0) {
        // Si aucun message chargé, recharger tout
        await loadMessages();
        return;
      }
      
      const lastMessageId = messages[messages.length - 1].id;
      const response = await api.get(`/chat/messages/recent/?since_id=${lastMessageId}`);
      const newMsgs = response.data;
      
      if (newMsgs.length > 0) {
        setMessages(prev => [...prev, ...newMsgs]);
      }
    } catch (err) {
      console.error('Error loading new messages:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      return;
    }

    try {
      const response = await api.post('/chat/messages/', {
        message: newMessage.trim(),
      });
      
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Erreur lors de l\'envoi du message');
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">💬 Chat Administratif</h1>
          <p className="page-subtitle">Communication réservée aux éditeurs et administrateurs</p>
        </div>

        <div className="chat-container card">
          <div className="chat-messages">
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-message ${msg.user_name === user?.username ? 'own-message' : ''}`}
                  >
                    <div className="message-author">{msg.user_name}</div>
                    <div className="message-content">{msg.message}</div>
                    <div className="message-time">
                      {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                
                {messages.length === 0 && (
                  <div className="empty-state">
                    <p className="text-muted">Aucun message. Démarrez la conversation !</p>
                  </div>
                )}
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="chat-input-form">
            <input
              type="text"
              className="form-control"
              placeholder="Tapez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>
              Envoyer
            </button>
          </form>
        </div>

        <div className="card mt-3">
          <div className="card-body">
            <p className="text-muted">
              <strong>Note :</strong> Ce chat est réservé à la communication entre les administrateurs et éditeurs de la Zone Franche. 
              Les messages se rafraîchissent automatiquement toutes les 2 secondes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
