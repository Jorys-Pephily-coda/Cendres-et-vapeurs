import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './Admin.css';

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    is_active: true,
    valid_from: '',
    valid_until: '',
    min_purchase: '0',
    max_uses: '',
    description: '',
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await api.get('/discounts/');
      setDiscounts(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching discounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dataToSend = {
        ...formData,
        valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : undefined,
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : undefined,
      };
      
      if (!dataToSend.valid_from) delete dataToSend.valid_from;
      if (!dataToSend.valid_until) delete dataToSend.valid_until;

      await api.post('/discounts/', dataToSend);
      fetchDiscounts();
      resetForm();
      alert('Code promo créé');
    } catch (err) {
      console.error('Error:', err);
      alert('Erreur lors de la création');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce code promo ?')) return;

    try {
      await api.delete(`/discounts/${id}/`);
      fetchDiscounts();
      alert('Code promo supprimé');
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      is_active: true,
      valid_from: '',
      valid_until: '',
      min_purchase: '0',
      max_uses: '',
      description: '',
    });
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Gestion des Codes Promo</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            + Nouveau code
          </button>
        </div>

        {showForm && (
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">Nouveau code promo</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        required
                        placeholder="PROMO10"
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <select
                        className="form-control"
                        value={formData.discount_type}
                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                      >
                        <option value="percentage">Pourcentage</option>
                        <option value="fixed">Montant fixe</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-4">
                    <div className="form-group">
                      <label className="form-label">
                        Valeur {formData.discount_type === 'percentage' ? '(%)' : '(₡)'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.discount_value}
                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-group">
                      <label className="form-label">Achat minimum</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.min_purchase}
                        onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-group">
                      <label className="form-label">Utilisations max</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.max_uses}
                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description (optionnel)</label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="2"
                  />
                </div>

                <div className="row">
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Valide du</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.valid_from}
                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Valide jusqu'au</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    {' '}Code actif
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Créer</button>
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Valeur</th>
                <th>Min. achat</th>
                <th>Utilisations</th>
                <th>Valide jusqu'au</th>
                <th>Actif</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((discount) => (
                <tr key={discount.id}>
                  <td><strong>{discount.code}</strong></td>
                  <td>
                    <span className="badge badge-user">
                      {discount.discount_type === 'percentage' ? '%' : '₡'}
                    </span>
                  </td>
                  <td>{discount.discount_value}</td>
                  <td>{discount.min_purchase || '-'}</td>
                  <td>
                    {discount.current_uses} / {discount.max_uses || '∞'}
                  </td>
                  <td>
                    {discount.valid_until
                      ? new Date(discount.valid_until).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Illimité'}
                  </td>
                  <td>
                    {discount.is_active ? (
                      <span className="text-success">✓</span>
                    ) : (
                      <span className="text-muted">✗</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(discount.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DiscountManagement;
