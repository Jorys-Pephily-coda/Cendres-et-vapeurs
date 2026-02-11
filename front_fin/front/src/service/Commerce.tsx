export const fetchCommerce = async () => {
    try {
        const response = await fetch('http://localhost:8000/api/products/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
        
        if (response.ok) {
            const data = await response.json()
            console.log('Commerce data fetched successfully:', data)
            return data
        } else {
            console.error('Failed to fetch commerce data:', response.statusText)
        }
    } catch (error) {
        console.error('Error during fetching commerce data:', error)
    }
}

