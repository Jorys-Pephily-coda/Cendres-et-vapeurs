const fetchCommerce = async () => {
    try {
        const response = await fetch('http://localhost:8000/api/products/?sort_by_votes=true', {
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


const addToCart = async (productId: number, quantity: number) => {
    try {
        const response = await fetch('http://localhost:8000/api/cart/add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ product_id: productId, quantity: quantity }),
        })
        if (response.ok) {
            const data = await response.json()
            console.log('Product added to cart successfully:', data)
            return data
        } else {
            console.error('Failed to add product to cart:', response.statusText)
        }
    } catch (error) {
        console.error('Error during adding to cart:', error)
    }
}

const voteProduct = async (productId: number) => {
    try {
        const response = await fetch(`http://localhost:8000/api/products/${productId}/vote/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
        if (response.ok) {
            const data = await response.json()
            console.log('Product voted successfully:', data)
            return data
        } else {
            console.error('Failed to vote for product:', response.statusText)
        }
    } catch (error) {
        console.error('Error during voting for product:', error)
    }
}

const searchProducts = async (query: string) => {
    try{
        const response = await fetch(`http://localhost:8000/api/products/?search=${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
        if (response.ok) {
            const data = await response.json()
            console.log('Search results fetched successfully:', data)
            return data
        } else {
            console.error('Failed to fetch search results:', response.statusText)
        }
    } catch (error) {
        console.error('Error during fetching search results:', error)
    }
} 

export { fetchCommerce, addToCart, voteProduct, searchProducts }