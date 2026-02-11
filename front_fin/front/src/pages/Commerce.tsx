import { useEffect, useState } from "react"
import { fetchCommerce, addToCart, voteProduct } from "../service/Commerce"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'
import '../styles/Commerce.css'

function Commerce() {
    const [commerceData, setCommerceData] = useState<any>([])
    const [loading, setLoading] = useState(true)

    const handleVote = async (productId: number) => {
        const result = await voteProduct(productId)
        if (result) {
            setCommerceData((prevData: any) => ({
                ...prevData,
                results: prevData.results.map((product: any) => 
                    product.id === productId 
                        ? { ...product, has_voted: !product.has_voted }
                        : product
                )
            }))
        }
    }

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
                        commerceData.results.map((product: any) => (
                            <div className="product-card" key={product.id}>
                                <div className="card-top">
                                    <div className="blank-card"> </div>
                                    <div className="product-name">
                                        <h3>{product.name}</h3>
                                    </div>
                                    <button 
                                    className="like-btn" 
                                    onClick={() => handleVote(product.id)}
                                    >
                                    <FontAwesomeIcon 
                                        icon={product.has_voted ? faHeartSolid : faHeartRegular} 
                                        className={product.has_voted ? 'heart-filled' : 'heart-empty'}
                                    />
                                </button>
                                </div>
                                <img src={product.image_url} alt="on est pauvre on a pas mis l'image" className="product-image" />
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
                            </div>
                        ))
                    ) : (
                    <p>Ya pas de panneau</p>
                )}
            </div>
        </div>
    )
}

export default Commerce