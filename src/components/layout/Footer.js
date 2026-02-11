import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Zone Franche</h4>
            <p>Cendres et Vapeur - Survivre dans les décombres du monde ancien.</p>
          </div>
          
          <div className="footer-section">
            <h4>Navigation</h4>
            <ul>
              <li><a href="/products">Boutique</a></li>
              <li><a href="/calendar">Planning</a></li>
              <li><a href="/monitoring">Toxicité</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Guilde</h4>
            <ul>
              <li><a href="/logs">Journal</a></li>
              <li><a href="/about">À propos</a></li>
              <li><a href="/terms">Règlement</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2026 Cendres et Vapeur - Tous droits réservés dans les terres dévastées</p>
          <p className="footer-credits">Forgé par le meilleur groupe</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
