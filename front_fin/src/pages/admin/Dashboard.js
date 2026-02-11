import React from 'react';
import { Link } from 'react-router-dom';
import './Admin.css';

const Dashboard = () => {
  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">⚙️ Dashboard Administrateur</h1>
          <p className="page-subtitle">Panneau de contrôle de la Zone Franche</p>
        </div>

        <div className="admin-grid">
          <Link to="/admin/users" className="admin-card card">
            <div className="admin-card-icon"></div>
            <h3>Utilisateurs</h3>
            <p>Gérer les membres de la colonie</p>
          </Link>

          <Link to="/admin/products" className="admin-card card">
            <div className="admin-card-icon"></div>
            <h3>Produits</h3>
            <p>Gérer le catalogue de la boutique</p>
          </Link>

          <Link to="/admin/discounts" className="admin-card card">
            <div className="admin-card-icon"></div>
            <h3>Codes Promo</h3>
            <p>Gérer les remises et promotions</p>
          </Link>

          <Link to="/orders" className="admin-card card">
            <div className="admin-card-icon"></div>
            <h3>Commandes</h3>
            <p>Voir toutes les commandes</p>
          </Link>

          <Link to="/calendar" className="admin-card card">
            <div className="admin-card-icon"></div>
            <h3>Planning</h3>
            <p>Gérer les événements</p>
          </Link>

          <Link to="/chat" className="admin-card card">
            <div className="admin-card-icon"></div>
            <h3>Chat</h3>
            <p>Communication administrative</p>
          </Link>

          <Link to="/monitoring" className="admin-card card">
            <div className="admin-card-icon"></div>
            <h3>Monitoring</h3>
            <p>Surveillance de la toxicité</p>
          </Link>

          <Link to="/logs" className="admin-card card">
            <div className="admin-card-icon"></div>
            <h3>Logs</h3>
            <p>Journal des activités</p>
          </Link>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Bienvenue, Administrateur</h3>
              </div>
              <div className="card-body">
                <p>
                  Vous avez accès à tous les outils de gestion de la Zone Franche. 
                  Utilisez ce tableau de bord pour superviser les opérations quotidiennes.
                </p>
                <ul>
                  <li>✓ Gestion complète des utilisateurs et de leurs rôles</li>
                  <li>✓ Administration des produits et des stocks</li>
                  <li>✓ Création et gestion des codes promotionnels</li>
                  <li>✓ Surveillance des commandes et transactions</li>
                  <li>✓ Planification des événements de la colonie</li>
                  <li>✓ Communication sécurisée via chat administratif</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
