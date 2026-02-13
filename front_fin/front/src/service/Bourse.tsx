

export const fetchBourseData = async (id: number) => {
    try {
        const response = await fetch(`http://localhost:8000/api/products/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
        if (response.ok) {
            const data = await response.json()
            console.log('Bourse data fetched successfully:', data)
            return data
        } else {
            console.error('Failed to fetch bourse data:', response.statusText)
            return null
        }
    } catch (error) {
        console.error('Error during fetching bourse data:', error)
        return null
    }
}

