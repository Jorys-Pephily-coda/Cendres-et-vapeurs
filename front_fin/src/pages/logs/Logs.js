import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './Logs.css';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/logs/', {
        params: { limit: 100 },
      });
      setLogs(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType) => {
    const icons = {
      login: '[Connexion]',
      logout: '[Déconnexion]',
      register: '[Inscription]',
      order_created: '[Commande]',
      product_created: '[Produit créé]',
      product_updated: '[Produit modifié]',
      product_deleted: '[Produit supprimé]',
      user_updated: '[Utilisateur]',
      vote_added: '[Vote ajouté]',
      vote_removed: '[Vote retiré]',
    };
    return icons[actionType] || '[Action]';
  };

  const filteredLogs = filter
    ? logs.filter((log) =>
        log.description.toLowerCase().includes(filter.toLowerCase()) ||
        log.action_type.includes(filter.toLowerCase())
      )
    : logs;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Journal de la Colonie</h1>
          <p className="page-subtitle">Activités récentes de la Zone Franche</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Activités ({filteredLogs.length})</h3>
            <input
              type="text"
              className="form-control"
              placeholder="Filtrer les logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
          </div>
          <div className="card-body">
            {loading ? (
              <div className="loading-spinner"></div>
            ) : filteredLogs.length === 0 ? (
              <div className="empty-state">
                <p>Aucune activité enregistrée</p>
              </div>
            ) : (
              <div className="logs-timeline">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="log-item">
                    <div className="log-icon">{getActionIcon(log.action_type)}</div>
                    <div className="log-content">
                      <div className="log-description">{log.description}</div>
                      <div className="log-meta">
                        <span className="log-user">
                          {log.user || 'Système'}
                        </span>
                        <span className="log-time">
                          {new Date(log.timestamp).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card mt-3">
          <div className="card-header">
            <h3 className="card-title">Légende</h3>
          </div>
          <div className="card-body">
            <div className="logs-legend">
              <div className="legend-item">Connexion</div>
              <div className="legend-item">Déconnexion</div>
              <div className="legend-item">Inscription</div>
              <div className="legend-item">Commande</div>
              <div className="legend-item">Produit</div>
              <div className="legend-item">Vote</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;
