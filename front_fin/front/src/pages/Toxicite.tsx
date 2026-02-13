import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { fetchData } from '../service/Toxicite';

Chart.register(...registerables);

function Toxicite() {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<Chart<'line'> | null>(null);

    useEffect(() => {
        const REFRESH_MS = 2000;
        const MAX_POINTS = 120;

        let alive = true;
        let intervalId: number | null = null;

        setError(null);

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) {
            setError('Canvas indisponible pour le graphique');
            return () => {
                alive = false;
            };
        }

        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }

        const labels: string[] = [];
        const sulfur: number[] = [];
        const carbon: number[] = [];
        const oxygen: number[] = [];
        const temperature: number[] = [];
        const pressure: number[] = [];

        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    { label: 'Soufre (%)', data: sulfur, borderWidth: 2, tension: 0.25, pointRadius: 0 },
                    { label: 'Carbone (%)', data: carbon, borderWidth: 2, tension: 0.25, pointRadius: 0 },
                    { label: 'Oxygène (%)', data: oxygen, borderWidth: 2, tension: 0.25, pointRadius: 0 },
                    { label: 'Température (°C)', data: temperature, borderWidth: 2, tension: 0.25, pointRadius: 0 },
                    { label: 'Pression (bar)', data: pressure, borderWidth: 2, tension: 0.25, pointRadius: 0 },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { display: true },
                },
                interaction: { mode: 'index', intersect: false },
                scales: {
                    x: { grid: { display: false } },
                },
            },
        });

        const tick = async () => {
            const result = await fetchData();
            if (!alive) return;
            if (!result) {
                setError("Impossible de récupérer les données de toxicité");
                return;
            }

            setData(result);
            setError(null);

            const label = new Date(result.timestamp ?? Date.now()).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            const sulfurValue = Number(result.sulfur_level);
            const carbonValue = Number(result.carbon_level);
            const oxygenValue = Number(result.oxygen_level);
            const temperatureValue = Number(result.temperature);
            const pressureValue = Number(result.pressure);

            if (
                !Number.isFinite(sulfurValue) ||
                !Number.isFinite(carbonValue) ||
                !Number.isFinite(oxygenValue) ||
                !Number.isFinite(temperatureValue) ||
                !Number.isFinite(pressureValue)
            ) {
                return;
            }

            labels.push(label);
            sulfur.push(sulfurValue);
            carbon.push(carbonValue);
            oxygen.push(oxygenValue);
            temperature.push(temperatureValue);
            pressure.push(pressureValue);

            if (labels.length > MAX_POINTS) {
                labels.shift();
                sulfur.shift();
                carbon.shift();
                oxygen.shift();
                temperature.shift();
                pressure.shift();
            }

            chartRef.current?.update('none');
        };

        tick();
        intervalId = window.setInterval(tick, REFRESH_MS);

        return () => {
            alive = false;
            if (intervalId !== null) window.clearInterval(intervalId);
            chartRef.current?.destroy();
            chartRef.current = null;
        };
    }, []);

    return (
        <div className="page">
            <h1>Toxicité en temps réel</h1>
            {error && <p>{error}</p>}

            <div className="chart-wrapper">
                <canvas ref={canvasRef} />
            </div>

            {data ? (
                <div>
                    <p>Soufre: {data.sulfur_level}%</p>
                    <p>Carbone: {data.carbon_level}%</p>
                    <p>Oxygène: {data.oxygen_level}%</p>
                    <p>Température: {data.temperature}°C</p>
                    <p>Pression: {data.pressure} bar</p>
                    <p>Niveau d'alerte: {data.alert_level}</p>
                    <p>Heure: {new Date(data.timestamp).toLocaleString()}</p>
                </div>
            ) : (
                <p>Chargement...</p>
            )}
        </div>
    );
}

export default Toxicite;