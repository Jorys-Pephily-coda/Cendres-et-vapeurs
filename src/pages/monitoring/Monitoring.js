import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import './Monitoring.css';

const Monitoring = () => {
  const [currentData, setCurrentData] = useState(null);
  const [history, setHistory] = useState([]);
  const [alert, setAlert] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Fetch initial data
    fetchToxicityData();
    
    // Poll every 5 seconds
    intervalRef.current = setInterval(fetchToxicityData, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fetchToxicityData = async () => {
    try {
      const response = await api.get('/monitoring/toxicity/current/');
      const data = response.data;
      
      // Convertir les données du backend au format attendu par le frontend
      const formattedData = {
        co2_level: data.carbon_level * 10 || 400,
        temperature: data.temperature || 20,
        humidity: data.oxygen_level * 3 || 50,
        air_quality_index: data.sulfur_level * 2 || 50,
        timestamp: data.timestamp || new Date().toISOString(),
        alert_level: data.alert_level || 'normal'
      };
      
      setCurrentData(formattedData);
      setHistory((prev) => [formattedData, ...prev].slice(0, 10));
      
      // Vérifier les seuils d'alerte
      checkAlerts(formattedData);
    } catch (err) {
      console.error('Error fetching toxicity data:', err);
    }
  };

  const checkAlerts = (data) => {
    if (data.co2_level > 1000) {
      setAlert({
        level: 'danger',
        message: '⚠️ ALERTE CRITIQUE - Niveau CO₂ très élevé !',
      });
    } else if (data.temperature > 30) {
      setAlert({
        level: 'warning',
        message: '⚠️ Température élevée détectée',
      });
    } else if (data.air_quality_index > 150) {
      setAlert({
        level: 'warning',
        message: '⚠️ Qualité de l\'air dégradée',
      });
    } else {
      setAlert(null);
    }
  };

  const getStatusClass = (value, thresholds) => {
    if (value >= thresholds.danger) return 'danger';
    if (value >= thresholds.warning) return 'warning';
    return 'success';
  };

  if (!currentData) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Connexion au moniteur de toxicité...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">☣️ Moniteur de Toxicité</h1>
          <p className="page-subtitle">Surveillance en temps réel</p>
        </div>

        {alert && (
          <div className={`alert alert-${alert.level} monitoring-alert`}>
            {alert.message}
          </div>
        )}

        <div className="monitoring-grid">
          <div className="monitor-card card">
            <div className="monitor-icon">💨</div>
            <div className="monitor-label">CO₂</div>
            <div className={`monitor-value ${getStatusClass(currentData.co2_level, { warning: 800, danger: 1000 })}`}>
              {currentData.co2_level.toFixed(1)}
              <span className="monitor-unit">ppm</span>
            </div>
            <div className="monitor-bar">
              <div
                className={`monitor-bar-fill ${getStatusClass(currentData.co2_level, { warning: 800, danger: 1000 })}`}
                style={{ width: `${Math.min((currentData.co2_level / 1500) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="monitor-card card">
            <div className="monitor-icon">🌡️</div>
            <div className="monitor-label">Température</div>
            <div className={`monitor-value ${getStatusClass(currentData.temperature, { warning: 25, danger: 30 })}`}>
              {currentData.temperature.toFixed(1)}
              <span className="monitor-unit">°C</span>
            </div>
            <div className="monitor-bar">
              <div
                className={`monitor-bar-fill ${getStatusClass(currentData.temperature, { warning: 25, danger: 30 })}`}
                style={{ width: `${Math.min((currentData.temperature / 40) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="monitor-card card">
            <div className="monitor-icon">💧</div>
            <div className="monitor-label">Humidité</div>
            <div className={`monitor-value ${getStatusClass(currentData.humidity, { warning: 70, danger: 85 })}`}>
              {currentData.humidity.toFixed(1)}
              <span className="monitor-unit">%</span>
            </div>
            <div className="monitor-bar">
              <div
                className={`monitor-bar-fill ${getStatusClass(currentData.humidity, { warning: 70, danger: 85 })}`}
                style={{ width: `${currentData.humidity}%` }}
              ></div>
            </div>
          </div>

          <div className="monitor-card card">
            <div className="monitor-icon">🌫️</div>
            <div className="monitor-label">Qualité de l'air</div>
            <div className={`monitor-value ${getStatusClass(currentData.air_quality_index, { warning: 100, danger: 150 })}`}>
              {currentData.air_quality_index.toFixed(0)}
              <span className="monitor-unit">AQI</span>
            </div>
            <div className="monitor-bar">
              <div
                className={`monitor-bar-fill ${getStatusClass(currentData.air_quality_index, { warning: 100, danger: 150 })}`}
                style={{ width: `${Math.min((currentData.air_quality_index / 200) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-header">
            <h3 className="card-title">Historique récent</h3>
          </div>
          <div className="card-body">
            {history.length === 0 ? (
              <p className="text-muted">Aucune donnée historique</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Heure</th>
                    <th>CO₂ (ppm)</th>
                    <th>Temp. (°C)</th>
                    <th>Humidité (%)</th>
                    <th>AQI</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((data, index) => (
                    <tr key={index}>
                      <td>{new Date(data.timestamp).toLocaleTimeString('fr-FR')}</td>
                      <td>{data.co2_level.toFixed(1)}</td>
                      <td>{data.temperature.toFixed(1)}</td>
                      <td>{data.humidity.toFixed(1)}</td>
                      <td>{data.air_quality_index.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-header">
            <h3 className="card-title">Légende des seuils</h3>
          </div>
          <div className="card-body">
            <div className="thresholds-info">
              <div className="threshold-item">
                <span className="status-indicator status-online"></span>
                <span>Normal - Conditions optimales</span>
              </div>
              <div className="threshold-item">
                <span className="status-indicator status-warning"></span>
                <span>Attention - Surveillance requise</span>
              </div>
              <div className="threshold-item">
                <span className="status-indicator status-danger"></span>
                <span>Danger - Action immédiate nécessaire</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
