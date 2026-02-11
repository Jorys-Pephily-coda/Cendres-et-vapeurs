import { useState, useEffect } from 'react'

export default function AlertOverlay() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Écoute les changements de classe sur le body (posés par Toxicity.jsx)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isAlert = document.body.classList.contains('alert-rouge')
      if (isAlert) {
        setDismissed(false)
        setVisible(true)
      } else {
        setVisible(false)
      }
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  if (!visible || dismissed) return null

  return (
    <div
      role="alertdialog"
      aria-modal="false"
      aria-live="assertive"
      aria-label="Alerte rouge — taux de soufre critique"
    >
      <div>
        <strong>⚠ ALERTE ROUGE</strong>
        <p>Taux de soufre critique détecté dans la colonie.</p>
        <p>Activez vos filtres respiratoires immédiatement.</p>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Fermer l'alerte"
        >
          Compris — Fermer
        </button>
      </div>
    </div>
  )
}