import "../styles/Home.css";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { fetchMonthEvents } from "../service/Calendar";
import { getLogs } from "../service/Log";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import { faMapPin } from "@fortawesome/free-solid-svg-icons/faMapPin";

interface Alert {
  level: "danger" | "warning";
  message: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  priority: "low" | "medium" | "high" | "critical";
  is_all_day: boolean;
  location: string;
  created_by: any;
}

interface LogEntry {
  id: number;
  user: number;
  user_name: string;
  action_type: string;
  action_type_display: string;
  description: string;
  timestamp: string;
}

function Home() {
  const [currentData, setCurrentData] = useState<any>(null);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const intervalRef = useRef<number | null>(null);
  const currentDate = new Date();

  const { user } = useAuth();

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const checkAlerts = (data: any): void => {
    if (data.co2_level > 1000) {
      setAlert({
        level: "danger",
        message: "/!\\ ALERTE CRITIQUE - Niveau CO₂ très élevé !",
      });
    } else if (data.temperature > 30) {
      setAlert({
        level: "warning",
        message: "/!\\ Température élevée détectée",
      });
    } else if (data.air_quality_index > 150) {
      setAlert({
        level: "warning",
        message: "/!\\ Qualité de l'air dégradée",
      });
    } else {
      setAlert(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/monitoring/toxicity/current/",
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }

        const data = await response.json();

        if (!mounted) return;

        const formattedData = {
          co2_level: data.carbon_level ?? 400,
          temperature: data.temperature ?? 20,
          humidity: data.oxygen_level ?? 50,
          air_quality_index: data.sulfur_level ?? 50,
          timestamp: data.timestamp ?? new Date().toISOString(),
          alert_level: data.alert_level ?? "normal",
        };

        setCurrentData(formattedData);
        checkAlerts(formattedData);
        setError(null);
      } catch (error) {
        if (!mounted) return;
        console.error("Erreur:", error);
        setError("Erreur de connexion au moniteur");
      }
    };

    fetchData();
    intervalRef.current = window.setInterval(fetchData, 5000);

    return () => {
      mounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadCurrentMonthEvents = async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const data = await fetchMonthEvents(year, month);
      if (data && data.events) {
        setEvents(data.events);
      }
    };

    const loadRecentLogs = async () => {
      const data = await getLogs(10);
      if (data && data.results) {
        setLogs(data.results);
      }
    };

    loadCurrentMonthEvents();
    loadRecentLogs();
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start_date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const closeModal = () => {
    setSelectedDate(null);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className="calendar-day empty"></div>
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDay(day);
    calendarDays.push(
      <div
        key={day}
        className={`calendar-day ${isToday(day) ? "today" : ""} ${
          dayEvents.length > 0 ? "has-events" : ""
        }`}
        onClick={() => handleDateClick(day)}
        style={{ cursor: dayEvents.length > 0 ? "pointer" : "default" }}
      >
        <span className="day-number">{day}</span>
        {dayEvents.length > 0 && (
          <div className="event-indicators">
            {dayEvents.slice(0, 3).map((event, idx) => (
              <div
                key={idx}
                className={`event-dot priority-${event.priority}`}
                title={event.title}
              ></div>
            ))}
            {dayEvents.length > 3 && (
              <span className="more-events">+{dayEvents.length - 3}</span>
            )}
          </div>
        )}
      </div>
    );
  }

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate.getDate()) : [];

  if (!currentData) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Connexion au moniteur de toxicité...</p>
            {error && <p className="error">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <fieldset className="figma-border">
        <legend>Home</legend>
        <h1>
          Bienvenue{" "}
          {user?.username || user?.email || user?.name || "Utilisateur"}
        </h1>
        <p>Welcome to our website!</p>

        <div className="horizontal">
          <div className="vertical">
            <div className="toxicity">
              <h1>Moniteur de toxicité</h1>
              {alert ? (
                <div className={`alert alert-${alert.level}`}>
                  {alert.message}
                </div>
              ) : (
                <div className="alert alert-success">
                  ✓ Tous les niveaux sont normaux
                </div>
              )}
            </div>
          </div>

          <div className="log">
            <h1>Journal des activités</h1>
            <div className="history-list">
              {logs.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Action</th>
                      <th>Description</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.user_name}</td>
                        <td>{log.action_type_display}</td>
                        <td>{log.description}</td>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Aucune activité récente</p>
              )}
            </div>
          </div>
        </div>

        <div className="calendar">
          <h1>
            Calendrier - {monthNames[currentDate.getMonth()]}{" "}
            {currentDate.getFullYear()}
          </h1>
          <div className="calendar-grid">
            {dayNames.map((day) => (
              <div key={day} className="calendar-day-name">
                {day}
              </div>
            ))}

      {selectedDate && selectedDayEvents.length > 0 && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>
              {selectedDate.toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h2>
            <div className="events-list">
              {selectedDayEvents.map((event) => (
                <div
                  key={event.id}
                  className={`event-item priority-${event.priority}`}
                >
                  <div className="event-header">
                    <h4>{event.title}</h4>
                    <span className={`priority-badge priority-${event.priority}`}>
                      {event.priority === "low"
                        ? "Basse"
                        : event.priority === "medium"
                          ? "Moyenne"
                          : event.priority === "high"
                            ? "Haute"
                            : "Critique"}
                    </span>
                  </div>
                  {event.description && <p>{event.description}</p>}
                  <div className="event-details">
                    <span>
                      <FontAwesomeIcon icon={faClock} />
                      {new Date(event.start_date).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {event.location && <span><FontAwesomeIcon icon={faMapPin} /> {event.location}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button onClick={closeModal} className="btn-cancel">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
            {calendarDays}
          </div>
        </div>
      </fieldset>
    </div>
  );
}

export default Home;
