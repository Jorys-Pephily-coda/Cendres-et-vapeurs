import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchMonthEvents, createEvent, updateEvent, deleteEvent } from '../service/Calendar'
import '../styles/Planning.css'

interface Event {
    id: number
    title: string
    description: string
    start_date: string
    end_date: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    is_all_day: boolean
    location: string
    created_by: any
}

function Planning() {
    const { user } = useAuth()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(false)
    const [showEventModal, setShowEventModal] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
        is_all_day: false,
        location: ''
    })

    const monthNames = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ]

    const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

    const isEditorOrAdmin = user && (user.role === 'EDITOR' || user.role === 'ADMIN')

    useEffect(() => {
        loadMonthEvents()
    }, [currentDate])

    const loadMonthEvents = async () => {
        setLoading(true)
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1
        const data = await fetchMonthEvents(year, month)
        if (data && data.events) {
            setEvents(data.events)
        }
        setLoading(false)
    }

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        return new Date(year, month + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1).getDay()
        return firstDay === 0 ? 6 : firstDay - 1
    }

    const getEventsForDay = (day: number) => {
        return events.filter(event => {
            const eventDate = new Date(event.start_date)
            return eventDate.getDate() === day &&
                   eventDate.getMonth() === currentDate.getMonth() &&
                   eventDate.getFullYear() === currentDate.getFullYear()
        })
    }

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const goToToday = () => {
        setCurrentDate(new Date())
        setSelectedDate(new Date())
    }

    const openEventModal = (event?: Event) => {
        if (event) {
            setSelectedEvent(event)
            setEventForm({
                title: event.title,
                description: event.description,
                start_date: event.start_date,
                end_date: event.end_date,
                priority: event.priority,
                is_all_day: event.is_all_day,
                location: event.location
            })
        } else {
            setSelectedEvent(null)
            const dateStr = selectedDate ? selectedDate.toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
            setEventForm({
                title: '',
                description: '',
                start_date: dateStr,
                end_date: dateStr,
                priority: 'medium',
                is_all_day: false,
                location: ''
            })
        }
        setShowEventModal(true)
    }

    const closeEventModal = () => {
        setShowEventModal(false)
        setSelectedEvent(null)
    }

    const handleSubmitEvent = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (selectedEvent) {
            const result = await updateEvent(selectedEvent.id, eventForm)
            if (result) {
                await loadMonthEvents()
                closeEventModal()
            }
        } else {
            const result = await createEvent(eventForm)
            if (result) {
                await loadMonthEvents()
                closeEventModal()
            }
        }
    }

    const handleDeleteEvent = async (eventId: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
            const result = await deleteEvent(eventId)
            if (result) {
                await loadMonthEvents()
                closeEventModal()
            }
        }
    }

    const isToday = (day: number) => {
        const today = new Date()
        return day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
    }

    const isSelected = (day: number) => {
        if (!selectedDate) return false
        return day === selectedDate.getDate() &&
            currentDate.getMonth() === selectedDate.getMonth() &&
            currentDate.getFullYear() === selectedDate.getFullYear()
    }

    const handleDateClick = (day: number) => {
        setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
    }

    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const calendarDays = []

    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayEvents = getEventsForDay(day)
        calendarDays.push(
            <div
                key={day}
                className={`calendar-day ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
                onClick={() => handleDateClick(day)}
            >
                <span className="day-number">{day}</span>
                {dayEvents.length > 0 && (
                    <div className="event-indicators">
                        {dayEvents.slice(0, 3).map((event, idx) => (
                            <div key={idx} className={`event-dot priority-${event.priority}`} title={event.title}></div>
                        ))}
                        {dayEvents.length > 3 && <span className="more-events">+{dayEvents.length - 3}</span>}
                    </div>
                )}
            </div>
        )
    }

    const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate.getDate()) : []

    return (
        <div className="planning">
            <div className="calendar-container">
                <div className="calendar-header">
                    <button onClick={previousMonth} className="nav-btn">←</button>
                    <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                    <button onClick={nextMonth} className="nav-btn">→</button>
                </div>
                
                <div className="calendar-actions">
                    <button onClick={goToToday} className="today-btn">Aujourd'hui</button>
                    {isEditorOrAdmin && (
                        <button onClick={() => openEventModal()} className="add-event-btn">
                            + Nouvel événement
                        </button>
                    )}
                </div>

                {loading && <div className="loading">Chargement...</div>}

                <div className="calendar-grid">
                    {dayNames.map(day => (
                        <div key={day} className="calendar-day-name">{day}</div>
                    ))}
                    {calendarDays}
                </div>
            </div>

            {selectedDate && (
                <div className="modal-overlay" onClick={() => setSelectedDate(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>
                            {selectedDate.toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </h2>
                        
                        {selectedDayEvents.length > 0 ? (
                            <div className="events-list">
                                {selectedDayEvents.map(event => (
                                    <div key={event.id} className={`event-item priority-${event.priority}`}>
                                        <div className="event-header">
                                            <h4>{event.title}</h4>
                                            <div className="event-header-right">
                                                <span className={`priority-badge priority-${event.priority}`}>
                                                    {event.priority === 'low' ? 'Basse' : 
                                                     event.priority === 'medium' ? 'Moyenne' : 
                                                     event.priority === 'high' ? 'Haute' : 'Critique'}
                                                </span>
                                                {isEditorOrAdmin && (
                                                    <div className="event-actions">
                                                        <button onClick={() => openEventModal(event)} className="btn-edit">✏️</button>
                                                        <button onClick={() => handleDeleteEvent(event.id)} className="btn-delete">🗑️</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {event.description && <p>{event.description}</p>}
                                        <div className="event-details">
                                            <span>⏰ {new Date(event.start_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            {event.location && <span>📍 {event.location}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-events">Aucun événement pour cette date</p>
                        )}

                        <div className="modal-actions">
                            <button onClick={() => setSelectedDate(null)} className="btn-cancel">Fermer</button>
                        </div>
                    </div>
                </div>
            )}

            {showEventModal && (
                <div className="modal-overlay" onClick={closeEventModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{selectedEvent ? 'Modifier l\'événement' : 'Nouvel événement'}</h2>
                        <form onSubmit={handleSubmitEvent}>
                            <div className="form-group">
                                <label>Titre *</label>
                                <input
                                    type="text"
                                    value={eventForm.title}
                                    onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={eventForm.description}
                                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                                    rows={3}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Début *</label>
                                    <input
                                        type="datetime-local"
                                        value={eventForm.start_date}
                                        onChange={(e) => setEventForm({...eventForm, start_date: e.target.value})}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Fin *</label>
                                    <input
                                        type="datetime-local"
                                        value={eventForm.end_date}
                                        onChange={(e) => setEventForm({...eventForm, end_date: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Priorité</label>
                                    <select
                                        value={eventForm.priority}
                                        onChange={(e) => setEventForm({...eventForm, priority: e.target.value as any})}
                                    >
                                        <option value="low">Basse</option>
                                        <option value="medium">Moyenne</option>
                                        <option value="high">Haute</option>
                                        <option value="critical">Critique</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Lieu</label>
                                    <input
                                        type="text"
                                        value={eventForm.location}
                                        onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={eventForm.is_all_day}
                                        onChange={(e) => setEventForm({...eventForm, is_all_day: e.target.checked})}
                                    />
                                    Toute la journée
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={closeEventModal} className="btn-cancel">Annuler</button>
                                <button type="submit" className="btn-submit">
                                    {selectedEvent ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Planning
