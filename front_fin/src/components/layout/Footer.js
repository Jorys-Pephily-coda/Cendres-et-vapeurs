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
          
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2026 Cendres et Vapeur - Tous droits réservés dans les terres dévastées</p>
          <p className="footer-credits">Forgé par skibidi</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
