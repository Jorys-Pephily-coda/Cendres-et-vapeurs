import { useEffect, useState } from "react"
import { fetchCommerce, addToCart } from "../service/Commerce"
import '../styles/Commerce.css'

function Commerce() {
    const [commerceData, setCommerceData] = useState<any>([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const getCommerceData = async () => {
            const data = await fetchCommerce()
            if (data) {
                setCommerceData(data)
                setLoading(false)
            }
            else{
                console.error('No commerce data received')
            }
        }
        getCommerceData()
        console.log('Commerce data:', commerceData)
    }, [])

    if (loading) {
        return <div>Loading...</div>
    }
    

    return (
        <div className="commerce">
            <div className="top">
                <div className="blank">
                    <h1></h1>
                </div>
                <div className="text">
                    <h1>Bienvenue dans la forge des nains</h1>
                    <p>Fait toi plaisir petit humain mais eh faut que ton porte monnaie tienne gamin</p>
                </div>
                <button className="bourse-btn">Cours de la bourse</button>
            </div>
            <div className="shop">
                {commerceData.count > 0 ? (
                    <ul>
                        {commerceData.results.map((product: any) => (
                            <li className="product-card" key={product.id}>
                                <h3>{product.name}</h3>
                                <p>{product.description}</p>
                                <p>Price: ${product.current_price}</p>
                                <p>Stock: {product.stock}</p>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max={product.stock} 
                                    defaultValue="1" 
                                    className="quantity-input"
                                />
                                <button className="panier" onClick={() => addToCart(product.id, 1)}>Ajouter au panier</button>
                            </li>
                        ))}
                    </ul>
                    ) : (
                    <p>Ya pas de panneau</p>
                )}
            </div>
        </div>
    )
}

export default Commerce