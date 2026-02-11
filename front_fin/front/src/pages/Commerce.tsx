import { useEffect, useState } from "react"
import { fetchCommerce } from "../service/Commerce"
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
            <h1>Bienvenue dans la forge des nains</h1>
            <p>Fait toi plaisir petit humain mais eh faut que ton porte monnaie tienne gamin</p>
            <button className="bourse-btn">Cours de la bourse</button>
            <div className="shop">
                {commerceData.count > 0 ? (
                    <ul>
                        {commerceData.results.map((product: any) => (
                            <li className="product-card" key={product.id}>
                                <h3>{product.name}</h3>
                                <p>{product.description}</p>
                                <p>Price: ${product.price}</p>
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