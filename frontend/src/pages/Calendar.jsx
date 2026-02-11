import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import api from '../services/api'

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return (new Date(year, month, 1).getDay() + 6) % 7
}

export default function Calendar() {
  const { user, hasRole } = useContext(AuthContext)
  const today = new Date()

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)
  const [events, setEvents] = useState([])
  const [notes, setNotes] = useState([])
  const [noteForm, setNoteForm] = useState({ shift: 'AM', content: '' })
  const [eventForm, setEventForm] = useState({ title: '', description: '', type: 'general', date: '' })
  const [showEventForm, setShowEventForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const canManageEvents = hasRole(['editor', 'admin'])

  useEffect(() => {
    fetchEvents()
  }, [year, month])

  useEffect(() => {
    if (selectedDate) fetchNotes(selectedDate)
  }, [selectedDate])

  const fetchEvents = async () => {
    try {
      const res = await api.get(`calendar/events?year=${year}&month=${month + 1}`)
      setEvents(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchNotes = async (date) => {
    try {
      const res = await api.get(`calendar/notes?date=${date}`)
      setNotes(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('calendar/notes', {
        date: selectedDate,
        shift: noteForm.shift,
        content: noteForm.content,
      })
      setNoteForm({ shift: 'AM', content: '' })
      fetchNotes(selectedDate)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNote = async (id) => {
    await api.delete(`calendar/notes/${id}`)
    fetchNotes(selectedDate)
  }

  const handleAddEvent = async (e) => {
    e.preventDefault()
    try {
      await api.post('calendar/events', eventForm)
      setEventForm({ title: '', description: '', type: 'general', date: '' })
      setShowEventForm(false)
      fetchEvents()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de l\'ajout')
    }
  }

  const handleDeleteEvent = async (id) => {
    if (!confirm('Supprimer cet événement ?')) return
    try {
      await api.delete(`calendar/events/${id}`)
      fetchEvents()
    } catch (err) {
      alert('Erreur lors de la suppression')
    }
  }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return events.filter(e => e.date === dateStr)
  }

  const formatDate = (day) =>
    `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`

  return (
    <main>
      <h1>Calendrier de la Colonie</h1>

      {canManageEvents && (
        <button onClick={() => setShowEventForm(!showEventForm)} style={{ marginBottom: '20px' }}>
          {showEventForm ? '✕ Fermer' : '➕ Ajouter un événement'}
        </button>
      )}

      {showEventForm && canManageEvents && (
        <form onSubmit={handleAddEvent} style={{ padding: '20px', border: '1px solid #b87333', marginBottom: '20px' }}>
          <h3>Nouvel événement</h3>
          <label>Titre</label>
          <input
            value={eventForm.title}
            onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
            required
          />
          <label>Description</label>
          <textarea
            value={eventForm.description}
            onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
            rows={3}
          />
          <label>Type</label>
          <select
            value={eventForm.type}
            onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
          >
            <option value="general">Général</option>
            <option value="maintenance">Maintenance</option>
            <option value="supply">Ravitaillement</option>
            <option value="curfew">Couvre-feu</option>
          </select>
          <label>Date</label>
          <input
            type="date"
            value={eventForm.date}
            onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
            required
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit">Ajouter</button>
            <button type="button" onClick={() => setShowEventForm(false)}>Annuler</button>
          </div>
        </form>
      )}

      {/* Navigation */}
      <nav aria-label="Navigation du calendrier">
        <button onClick={prevMonth} aria-label="Mois précédent">‹</button>
        <span>{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} aria-label="Mois suivant">›</button>
      </nav>

      {/* Grille */}
      <table role="grid" aria-label={`Calendrier ${MONTHS[month]} ${year}`}>
        <thead>
          <tr>
            {DAYS.map(d => <th key={d} scope="col">{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) }).map((_, week) => (
            <tr key={week}>
              {Array.from({ length: 7 }).map((_, dayIdx) => {
                const dayNum = week * 7 + dayIdx - firstDay + 1
                if (dayNum < 1 || dayNum > daysInMonth) return <td key={dayIdx} />
                const dayEvents = getEventsForDay(dayNum)
                const dateStr = formatDate(dayNum)
                const isToday = dateStr === today.toISOString().split('T')[0]
                const isSelected = dateStr === selectedDate
                return (
                  <td
                    key={dayIdx}
                    onClick={() => setSelectedDate(dateStr)}
                    role="gridcell"
                    aria-label={`${dayNum} ${MONTHS[month]}, ${dayEvents.length} événement(s)`}
                    aria-selected={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedDate(dateStr)}
                    className={[
                      isToday ? 'today' : '',
                      isSelected ? 'selected' : '',
                      dayEvents.length > 2 ? 'high-pressure' : '',
                    ].join(' ')}
                  >
                    <span>{dayNum}</span>
                    {dayEvents.map(ev => (
                      <span key={ev.id} className={`event event-${ev.type}`} title={ev.title}>
                        {ev.title}
                        {canManageEvents && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev.id); }}
                            style={{ marginLeft: '5px', fontSize: '10px', padding: '2px' }}
                          >
                            ✕
                          </button>
                        )}
                      </span>
                    ))}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Notes de quart */}
      {selectedDate && (
        <section aria-label={`Notes du ${selectedDate}`}>
          <h2>Notes du {selectedDate}</h2>

          {notes.length === 0 ? (
            <p>Aucune note pour ce jour.</p>
          ) : (
            <ul role="list">
              {notes.map(n => (
                <li key={n.id}>
                  <strong>[{n.shift}]</strong> {n.content}
                  {user && (
                    <button
                      onClick={() => handleDeleteNote(n.id)}
                      aria-label="Supprimer cette note"
                    >
                      ✕
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {user && (
            <form onSubmit={handleAddNote} aria-label="Ajouter une note de quart">
              <label htmlFor="shift">Quart</label>
              <select
                id="shift"
                value={noteForm.shift}
                onChange={(e) => setNoteForm({ ...noteForm, shift: e.target.value })}
                aria-label="Choisir le quart"
              >
                <option value="AM">Matin (AM)</option>
                <option value="PM">Soir (PM)</option>
              </select>

              <label htmlFor="note-content">Note</label>
              <textarea
                id="note-content"
                value={noteForm.content}
                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                required
                aria-label="Contenu de la note"
              />

              <button type="submit" disabled={loading} aria-busy={loading}>
                {loading ? 'Enregistrement...' : 'Ajouter la note'}
              </button>
            </form>
          )}
        </section>
      )}
    </main>
  )
}