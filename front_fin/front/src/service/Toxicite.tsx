export const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/monitoring/toxicity/current/', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.ok) {
                    const result = await response.json();
                    return result;
                }
            } catch (error) {
                console.error('Erreur:', error);
            }
        };