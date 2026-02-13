export const getLogs = async (limit?: number) => {
    try {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        
        const response = await fetch(`http://localhost:8000/api/logs/?${params}`, {
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