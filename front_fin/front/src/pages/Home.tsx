import "../styles/Home.css";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";

interface Alert {
  level: "danger" | "warning";
  message: string;
}

interface Thresholds {
  warning: number;
  danger: number;
}

function Home() {
  const [currentData, setCurrentData] = useState<any>(null);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const { user } = useAuth();

  const checkAlerts = (data: any): void => {
    if (data.co2_level > 1000) {
      setAlert({
        level: "danger",
        message: "⚠️ ALERTE CRITIQUE - Niveau CO₂ très élevé !",
      });
    } else if (data.temperature > 30) {
      setAlert({
        level: "warning",
        message: "⚠️ Température élevée détectée",
      });
    } else if (data.air_quality_index > 150) {
      setAlert({
        level: "warning",
        message: "⚠️ Qualité de l'air dégradée",
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

  const getStatusClass = (value: number, thresholds: Thresholds): string => {
    if (value >= thresholds.danger) return "danger";
    if (value >= thresholds.warning) return "warning";
    return "success";
  };

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
            <div className="history-list"></div>
          </div>
        </div>

        <div className="calendar">
          <h1>Calendrier</h1>
          {/* TODO: Implémenter le calendrier */}
        </div>
      </fieldset>
    </div>
  );
}

export default Home;
