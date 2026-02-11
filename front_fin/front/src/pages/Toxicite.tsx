import { useEffect, useState } from 'react';

function Toxicite() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/monitoring/toxicity/current/', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                }
            } catch (error) {
                console.error('Erreur:', error);
            }
        };

        fetchData();

        const interval = setInterval(fetchData, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h1>Toxicité en temps réel</h1>
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