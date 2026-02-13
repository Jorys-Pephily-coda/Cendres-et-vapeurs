import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { Chart, registerables } from "chart.js"
import { fetchBourseData } from "../service/Bourse"

Chart.register(...registerables)


function Bourse() {

    const params = useParams()
    const id = useMemo(() => {
        const parsed = params.id ? Number.parseInt(params.id, 10) : 1
        return Number.isFinite(parsed) ? parsed : 1
    }, [params.id])

    const [bourseData, setBourseData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [percent, setPercent] = useState<number | null>(null)

    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const chartRef = useRef<Chart<"line"> | null>(null)

    useEffect(() => {
        const MAX_POINTS = 120
        const REFRESH_MS = 1000

        let alive = true
        let intervalId: number | null = null

        setLoading(true)
        setError(null)
        setBourseData(null)

        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!ctx) {
            setLoading(false)
            setError("Canvas indisponible pour le graphique")
            return () => {
                alive = false
            }
        }

        if (chartRef.current) {
            chartRef.current.destroy()
            chartRef.current = null
        }

        const labels: string[] = []
        const values: number[] = []

        chartRef.current = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "Prix",
                        data: values,
                        borderWidth: 2,
                        tension: 0.25,
                        pointRadius: 0,
                        fill: false,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { display: false },
                },
                interaction: { mode: "index", intersect: false },
                scales: {
                    x: {
                        grid: { display: false },
                    },
                },
            },
        })

        const tick = async () => {
            const data = await fetchBourseData(id)
            if (!alive) return
            if (!data) {
                setLoading(false)
                setError("Impossible de récupérer les données de bourse")
                return
            }

            setBourseData(data)

            const base = Number(data.base_price)
            const current = Number(data.current_price)
            if (Number.isFinite(base) && base > 0 && Number.isFinite(current)) {
                const percentValue = ((current - base) / base) * 100
                setPercent(percentValue)
            } else {
                setPercent(null)
            }

            setLoading(false)
            setError(null)

            const priceCandidate = data.current_price ?? data.price ?? data.currentPrice
            const price = Number(priceCandidate)
            if (!Number.isFinite(price)) return

            const label = new Date().toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            })

            labels.push(label)
            values.push(price)

            if (labels.length > MAX_POINTS) {
                labels.shift()
                values.shift()
            }

            chartRef.current?.update("none")
        }

        tick()
        intervalId = window.setInterval(tick, REFRESH_MS)

        return () => {
            alive = false
            if (intervalId !== null) window.clearInterval(intervalId)
            chartRef.current?.destroy()
            chartRef.current = null
        }
    }, [id])

    

    return (
        <>
            <div className="page">
            <h1>Bourse</h1>

            {loading && <p>Loading...</p>}

            {error && <p>{error}</p>}

            {bourseData && (
                <div className="product-info">
                    <p><strong>Produit:</strong> {bourseData.name}</p>
                    <p><strong>Prix de base:</strong> {bourseData.base_price}</p>
                    <p><strong>Prix actuel:</strong> {bourseData.current_price}</p>
                    <p>Taux d'augmentation: {percent !== null ? percent.toFixed(2) + "%" : "N/A"}</p>
                </div>
            )}

            <div className="chart-wrapper">
                <canvas ref={canvasRef} />
            </div>
            </div>
        </>
    )
}

export default Bourse