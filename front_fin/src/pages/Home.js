import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <div className="steam-bg"></div>
      
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Bienvenue dans la Zone Franche</h1>
          <p className="hero-subtitle">
            Où les cendres du passé rencontrent la vapeur de l'avenir
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-lg">
              Découvrir la Boutique
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Rejoindre la Guilde
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Services de la Colonie</h2>
          <div className="grid grid-3">
            <div className="feature-card card">
              <div className="feature-icon"></div>
              <h3>Boutique</h3>
              <p>
                Échangez vos ressources contre des équipements essentiels à la survie.
                Prix fluctuants selon l'offre et la demande.
              </p>
              <Link to="/products" className="btn btn-secondary">Explorer</Link>
            </div>

            <div className="feature-card card">
              <div className="feature-icon"></div>
              <h3>Planning</h3>
              <p>
                Consultez les quarts de travail et les événements de la colonie.
                Notez vos observations quotidiennes.
              </p>
              <Link to="/calendar" className="btn btn-secondary">Consulter</Link>
            </div>

            <div className="feature-card card">
              <div className="feature-icon"></div>
              <h3>Moniteur</h3>
              <p>
                Surveillez en temps réel les niveaux de toxicité de l'air.
                Restez vigilant pour votre sécurité.
              </p>
              <Link to="/monitoring" className="btn btn-secondary">Surveiller</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">100+</div>
              <div className="stat-label">Produits</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">500+</div>
              <div className="stat-label">Survivants</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Surveillance</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">Sûr</div>
              <div className="stat-label">Sécurisé</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-content card">
            <h2>Prêt à survivre ?</h2>
            <p>
              Rejoignez la communauté des survivants et accédez à tous les services de la Zone Franche.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              S'inscrire maintenant
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
