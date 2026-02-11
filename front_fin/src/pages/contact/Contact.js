import React, { useState } from 'react';
import api from '../../api/axios';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/contact/send/', formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📮 Contactez la Guilde</h1>
          <p className="page-subtitle">Envoyez-nous un message</p>
        </div>

        <div className="row">
          <div className="col-8">
            <div className="card">
              <div className="card-body">
                {success && (
                  <div className="alert alert-success">
                    ✓ Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.
                  </div>
                )}
                
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-6">
                      <div className="form-group">
                        <label htmlFor="name" className="form-label">
                          Nom complet
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className="form-control"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="form-group">
                        <label htmlFor="email" className="form-label">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className="form-control"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject" className="form-label">
                      Sujet
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      className="form-control"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message" className="form-label">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      className="form-control"
                      rows="8"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? 'Envoi en cours...' : 'Envoyer le message'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-4">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Informations</h3>
              </div>
              <div className="card-body">
                <div className="contact-info">
                  <div className="contact-info-item">
                    <div className="contact-icon">📍</div>
                    <div>
                      <strong>Adresse</strong>
                      <p>Zone Franche Cendres et Vapeur<br />Secteur 7, Ruines du Vieux Monde</p>
                    </div>
                  </div>

                  <div className="contact-info-item">
                    <div className="contact-icon">📧</div>
                    <div>
                      <strong>Email</strong>
                      <p>contact@cendres-vapeur.zone</p>
                    </div>
                  </div>

                  <div className="contact-info-item">
                    <div className="contact-icon">⏰</div>
                    <div>
                      <strong>Horaires</strong>
                      <p>24/7 - La Guilde ne dort jamais</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card mt-3">
              <div className="card-header">
                <h3 className="card-title">Besoin d'aide ?</h3>
              </div>
              <div className="card-body">
                <p>
                  Consultez notre <a href="/faq">FAQ</a> pour trouver des réponses rapides aux questions fréquentes.
                </p>
                <p>
                  Pour les urgences, contactez directement un administrateur via le <a href="/chat">chat</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
