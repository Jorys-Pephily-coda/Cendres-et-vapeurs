import { useState, useEffect, useRef } from 'react'
import api from '../services/api'

const THRESHOLD = 70
const POLL_INTERVAL = 5000

export default function Toxicity() {
  const [level, setLevel] = useState(null)
  const [history, setHistory] = useState([])
  const [alert, setAlert] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    fetchToxicity()
    intervalRef.current = setInterval(fetchToxicity, POLL_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (level !== null) {
      const isAlert = level >= THRESHOLD
      setAlert(isAlert)
      // Modifier la classe du body pour l'alerte globale
      if (isAlert) {
        document.body.classList.add('alert-rouge')
      } else {
        document.body.classList.remove('alert-rouge')
      }
    }
    return () => document.body.classList.remove('alert-rouge')
  }, [level])

  const fetchToxicity = async () => {
    try {
      const res = await api.get('/toxicity/current')
      const value = res.data.level
      setLevel(value)
      setHistory(prev => {
        const updated = [...prev, { value, time: new Date().toLocaleTimeString('fr-FR') }]
        return updated.slice(-20) // garder les 20 dernières valeurs
      })
    } catch (err) {
      console.error(err)
    }
  }

  const getColor = (val) => {
    if (val >= THRESHOLD) return '#c0392b'
    if (val >= 50) return '#e67e22'
    return '#27ae60'
  }

  return (
    <main className={alert ? 'alert-rouge' : ''}>
      <h1>Moniteur de Toxicité</h1>

      {level !== null && (
        <>
          <p role="status" aria-live="assertive">
            {alert
              ? `⚠ ALERTE ROUGE — Taux de soufre critique : ${level}%`
              : `✓ Niveau normal — Taux de soufre : ${level}%`}
          </p>

          {/* Jauge */}
          <div
            role="meter"
            aria-valuenow={level}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Taux de toxicité : ${level}%`}
          >
            <div
              style={{
                width: `${level}%`,
                backgroundColor: getColor(level),
                height: '24px',
                transition: 'width 0.5s ease, background-color 0.5s ease',
              }}
            />
            <span>{level}%</span>
          </div>

          <p>Seuil d'alerte : {THRESHOLD}%</p>
          <p>Mise à jour toutes les {POLL_INTERVAL / 1000} secondes.</p>
        </>
      )}

      {/* Historique */}
      <section aria-label="Historique des mesures">
        <h2>Historique récent</h2>
        {history.length === 0 ? (
          <p>Aucune mesure disponible.</p>
        ) : (
          <ul role="list">
            {[...history].reverse().map((entry, i) => (
              <li key={i} style={{ color: getColor(entry.value) }}>
                {entry.time} — {entry.value}%
                {entry.value >= THRESHOLD && ' ⚠'}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}