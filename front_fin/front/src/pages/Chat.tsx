import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Chat.css';

interface ChatMessage {
    id: number;
    user: number;
    user_name: string;
    user_role: string;
    message: string;
    is_system: boolean;
    created_at: string;
}

function Chat() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollingIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (user?.role !== 'ADMIN' && user?.role !== 'EDITOR') {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        fetchMessages();
        pollingIntervalRef.current = window.setInterval(() => {
            pollNewMessages();
        }, 2000);

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/chat/messages/?limit=50', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data.results || data);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const pollNewMessages = async () => {
        if (messages.length === 0) return;

        const lastMessageId = messages[messages.length - 1].id;
        try {
            const response = await fetch(
                `http://localhost:8000/api/chat/messages/recent/?since_id=${lastMessageId}`,
                {
                    credentials: 'include',
                }
            );
            if (response.ok) {
                const data = await response.json();
                const newMessages = data.results || data;
                if (newMessages.length > 0) {
                    setMessages(prev => [...prev, ...newMessages]);
                }
            }
        } catch (error) {
            console.error('Erreur lors du polling des messages:', error);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await fetch('http://localhost:8000/api/chat/messages/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ message: newMessage }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, data]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'admin';
            case 'EDITOR':
                return 'editor';
            default:
                return 'user';
        }
    };

    if (user?.role !== 'ADMIN' && user?.role !== 'EDITOR') {
        return <div>Accès refusé</div>;
    }

    if (loading) {
        return <div>Chargement...</div>;
    }

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h1>Chat</h1>
                <Link to="/">Retour à l'accueil</Link>
            </div>

            <div className="chat-messages">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`chat-message ${msg.is_system ? 'system' : ''}`}
                    >
                        <div className="message-header">
                            <strong>{msg.user_name}</strong>
                            <span className={`role-badge ${getRoleBadgeClass(msg.user_role)}`}>
                                {msg.user_role}
                            </span>
                            <span className="message-time">
                                {formatDate(msg.created_at)}
                            </span>
                        </div>
                        <div className="message-content">{msg.message}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="chat-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="chat-input"
                />
                <button type="submit" className="chat-button">
                    Envoyer
                </button>
            </form>
        </div>
    );
}

export default Chat;