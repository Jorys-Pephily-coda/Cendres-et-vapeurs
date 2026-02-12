export const getLogs = async () => {
    try {
        const response = await fetch('http://localhost:8000/api/logs/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Logs fetched successfully:', data);
            return data;
        } else {
            console.error('Failed to fetch logs:', response.statusText);
            return null;
        }
    } catch (error) {
        console.error('Error during fetching logs:', error);
        return null;
    }
};