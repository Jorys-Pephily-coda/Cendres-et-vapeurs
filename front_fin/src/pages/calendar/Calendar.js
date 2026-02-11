import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './Calendar.css';

const Calendar = () => {
  const { isEditor } = useAuth();
  const [events, setEvents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditingEvent, setIsEditingEvent] = useState(false);

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    priority: 'medium',
  });

  const [noteForm, setNoteForm] = useState({
    date: '',
    shift: 'morning',
    content: '',
  });

  // Générer les jours du mois
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevMonthDay = new Date(year, month, -i);
      days.push({ date: prevMonthDay, isCurrentMonth: false });
    }
    
    // Jours du mois courant
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }
    
    // Jours du mois suivant
    const remainingDays = 42 - days.length; // 6 semaines max
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventStart = new Date(event.start_date).toISOString().split('T')[0];
      const eventEnd = new Date(event.end_date).toISOString().split('T')[0];
      return dateStr >= eventStart && dateStr <= eventEnd;
    });
  };

  const getNotesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return notes.filter(note => note.date === dateStr);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  useEffect(() => {
    fetchEvents();
    fetchNotes();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/calendar/events/');
      setEvents(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await api.get('/calendar/notes/');
      setNotes(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  const openEventModal = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
    setIsEditingEvent(false);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
    setIsEditingEvent(false);
  };

  const startEditingEvent = () => {
    setEventForm({
      title: selectedEvent.title,
      description: selectedEvent.description,
      start_date: selectedEvent.start_date,
      end_date: selectedEvent.end_date,
      priority: selectedEvent.priority,
    });
    setIsEditingEvent(true);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/calendar/events/', eventForm);
      fetchEvents();
      setShowEventForm(false);
      setEventForm({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        priority: 'medium',
      });
    } catch (err) {
      alert('Erreur lors de la création de l\'événement');
    }
  };

  const handleEventUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/calendar/events/${selectedEvent.id}/`, eventForm);
      fetchEvents();
      closeEventModal();
    } catch (err) {
      alert('Erreur lors de la modification');
    }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/calendar/notes/', noteForm);
      fetchNotes();
      setShowNoteForm(false);
      setNoteForm({
        date: '',
        shift: 'morning',
        content: '',
      });
    } catch (err) {
      alert('Erreur lors de la création de la note');
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Supprimer cet événement ?')) return;
    try {
      await api.delete(`/calendar/events/${id}/`);
      fetchEvents();
      closeEventModal();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm('Supprimer cette note ?')) return;
    try {
      await api.delete(`/calendar/notes/${id}/`);
      fetchNotes();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'badge-user',
      medium: 'badge-editor',
      high: 'badge-warning',
      critical: 'badge-danger',
    };
    return colors[priority] || 'badge-user';
  };

  const getShiftIcon = (shift) => {
    const icons = {
      morning: '🌅',
      evening: '🌆',
    };
    return icons[shift] || '📝';
  };

  return (
    <div className="page">
      <div className="container-fluid">
        <div className="page-header">
          <h1 className="page-title">📅 Calendrier</h1>
          <div className="calendar-controls">
            <button onClick={goToPreviousMonth} className="btn btn-secondary">← Précédent</button>
            <button onClick={goToToday} className="btn btn-primary">Aujourd'hui</button>
            <button onClick={goToNextMonth} className="btn btn-secondary">Suivant →</button>
            {isEditor() && (
              <>
                <button onClick={() => setShowEventForm(!showEventForm)} className="btn btn-success">
                  + Événement
                </button>
                <button onClick={() => setShowNoteForm(!showNoteForm)} className="btn btn-info">
                  + Note
                </button>
              </>
            )}
          </div>
        </div>

        {showEventForm && isEditor() && (
          <div className="card mb-3">
            <div className="card-header">
              <h3 className="card-title">Nouvel événement</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleEventSubmit} className="event-form">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Titre de l'événement"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea
                    className="form-control"
                    placeholder="Description"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    rows="2"
                  />
                </div>
                <div className="row">
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Date début</label>
                      <input
                        type="date"
                        className="form-control"
                        value={eventForm.start_date}
                        onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Date fin</label>
                      <input
                        type="date"
                        className="form-control"
                        value={eventForm.end_date}
                        onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Priorité</label>
                  <select
                    className="form-control"
                    value={eventForm.priority}
                    onChange={(e) => setEventForm({ ...eventForm, priority: e.target.value })}
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="critical">Critique</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Créer</button>
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="btn btn-secondary"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showNoteForm && (
          <div className="card mb-3">
            <div className="card-header">
              <h3 className="card-title">Nouvelle note de quart</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleNoteSubmit} className="note-form">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={noteForm.date}
                    onChange={(e) => setNoteForm({ ...noteForm, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quart</label>
                  <select
                    className="form-control"
                    value={noteForm.shift}
                    onChange={(e) => setNoteForm({ ...noteForm, shift: e.target.value })}
                  >
                    <option value="morning">Matin</option>
                    <option value="evening">Soir</option>
                  </select>
                </div>
                <div className="form-group">
                  <textarea
                    className="form-control"
                    placeholder="Contenu de la note"
                    value={noteForm.content}
                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                    rows="3"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Créer</button>
                  <button
                    type="button"
                    onClick={() => setShowNoteForm(false)}
                    className="btn btn-secondary"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="calendar-header-month">
          <h2>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
        </div>

        <div className="calendar-grid">
          <div className="calendar-weekdays">
            {dayNames.map(day => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}
          </div>
          
          <div className="calendar-days">
            {getDaysInMonth(currentMonth).map((dayInfo, index) => {
              const dayEvents = getEventsForDate(dayInfo.date);
              const dayNotes = getNotesForDate(dayInfo.date);
              const isToday = dayInfo.date.toDateString() === new Date().toDateString();
              const isSelected = dayInfo.date.toDateString() === selectedDate.toDateString();
              
              return (
                <div
                  key={index}
                  className={`calendar-day ${!dayInfo.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedDate(dayInfo.date);
                    if (dayEvents.length === 1) {
                      openEventModal(dayEvents[0]);
                    } else if (dayEvents.length > 1) {
                      setSelectedDate(dayInfo.date);
                      // On pourrait ouvrir une modal de sélection d'événement ici
                    }
                  }}
                >
                  <div className="day-number">{dayInfo.date.getDate()}</div>
                  <div className="day-content">
                    {dayEvents.map(event => (
                      <div 
                        key={event.id} 
                        className={`event-badge ${getPriorityColor(event.priority)}`}
                        title={event.title}
                      >
                        {event.title.substring(0, 15)}{event.title.length > 15 ? '...' : ''}
                      </div>
                    ))}
                    {dayNotes.map(note => (
                      <div key={note.id} className="note-badge" title={note.content}>
                        {getShiftIcon(note.shift)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal pour afficher/éditer un événement */}
        {showEventModal && selectedEvent && (
          <div className="modal-overlay" onClick={closeEventModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{isEditingEvent ? 'Modifier l\'événement' : selectedEvent.title}</h2>
                <button onClick={closeEventModal} className="modal-close">✕</button>
              </div>
              
              <div className="modal-body">
                {!isEditingEvent ? (
                  <>
                    <div className="event-detail">
                      <label>Description</label>
                      <p>{selectedEvent.description || 'Aucune description'}</p>
                    </div>
                    
                    <div className="event-detail">
                      <label>Période</label>
                      <p>
                        Du {new Date(selectedEvent.start_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        {' au '}
                        {new Date(selectedEvent.end_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    
                    <div className="event-detail">
                      <label>Priorité</label>
                      <span className={`badge ${getPriorityColor(selectedEvent.priority)}`}>
                        {selectedEvent.priority === 'low' && 'Basse'}
                        {selectedEvent.priority === 'medium' && 'Moyenne'}
                        {selectedEvent.priority === 'high' && 'Haute'}
                        {selectedEvent.priority === 'critical' && 'Critique'}
                      </span>
                    </div>

                    {isEditor() && (
                      <div className="modal-actions">
                        <button onClick={startEditingEvent} className="btn btn-primary">
                          ✏️ Modifier
                        </button>
                        <button onClick={() => deleteEvent(selectedEvent.id)} className="btn btn-danger">
                          🗑️ Supprimer
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <form onSubmit={handleEventUpdate}>
                    <div className="form-group">
                      <label className="form-label">Titre</label>
                      <input
                        type="text"
                        className="form-control"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        value={eventForm.description}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        rows="3"
                      />
                    </div>
                    
                    <div className="row">
                      <div className="col-6">
                        <div className="form-group">
                          <label className="form-label">Date début</label>
                          <input
                            type="date"
                            className="form-control"
                            value={eventForm.start_date}
                            onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="form-group">
                          <label className="form-label">Date fin</label>
                          <input
                            type="date"
                            className="form-control"
                            value={eventForm.end_date}
                            onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Priorité</label>
                      <select
                        className="form-control"
                        value={eventForm.priority}
                        onChange={(e) => setEventForm({ ...eventForm, priority: e.target.value })}
                      >
                        <option value="low">Basse</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Haute</option>
                        <option value="critical">Critique</option>
                      </select>
                    </div>
                    
                    <div className="modal-actions">
                      <button type="submit" className="btn btn-primary">
                        💾 Enregistrer
                      </button>
                      <button type="button" onClick={() => setIsEditingEvent(false)} className="btn btn-secondary">
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
